// `Validator` Object
function Validator(options) {
    // tìm `.form-group` trong case nó không phải là thẻ cha trực tiếp của thẻ input
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
        }
        element = element.parentElement;
    }

    // create an object contains all rules (avoid overwriting)
    var selectorRules = {};
    // lấy element (hay '#form-1')
    var formElement = document.querySelector(options.form);

    // execute `validate`
    function validate(inputElement, rule) {
        // get '.form-group'
        var parentE = getParent(inputElement, options.formGroupSelector);

        // '.form-message'
        var errorElement = parentE.querySelector(options.errorSelector);

        var errorMessage;

        // các test trong mỗi rule
        var rules = selectorRules[rule.selector];

        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ":checked")
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) {
                break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            parentE.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            parentE.classList.remove("invalid");
        }

        return !errorMessage;
    }

    // kiểm tra nếu có form đó thì:
    if (formElement) {
        // when submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            // kiểm tra form đúng hết dữ liệu hay chưa để đưa tất cả vào 1 object trong data sau này
            var isFormValid = true;

            // Loop through each rule then validate it immediately
            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector); // selector được truyền vào hàm
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Case submit with JS
                if (typeof options.onSubmit === "function") {
                    // querySelectorAll return a NodeList, it's not same as array
                    var enableInputs = formElement.querySelectorAll(
                        "[name]:not([disable])"  // 
                    );

                    var formValues = Array.from(enableInputs).reduce(function (
                        values,
                        input
                    ) {
                        switch (input.type) {
                            case "checkbox":
                                if (input.matches(":checked")) {
                                    values[input.name] = "";
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);

                            case "radio":
                                values[input.name] = formElement.querySelector(
                                    'input[name="' + input.name + '"]:checked'
                                ).value;
                                break;
                            case "file":
                                values[input.name] = input.files; // return FileList
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        // name: attribute of input element, dif from others
                        return values; // return values
                    },
                    {});
                    options.onSubmit(formValues);
                } else {
                    formElement.submit(); // Case submit of browser
                }
            }
        };

        // Loop through each rule and execute events (blur, input,...)
        // options.rules is an array
        options.rules.forEach((rule) => {
            // Lưu lại các rules cho mỗi input (selector):
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            // không đi vào từ document mà get từ formElement để lấy id của input tương ứng
            // var inputElement = formElement.querySelector(rule.selector); // selector được truyền vào hàm
            // get tất cả những input có cùng name là gender
            var inputElements = formElement.querySelectorAll(rule.selector); // NodeList
            Array.from(inputElements).forEach(function (inputElement) {
                var parentE = getParent(
                    inputElement,
                    options.formGroupSelector
                );

                // when blur out input
                inputElement.onblur = function () {
                    // value: inputElement.value
                    // test: rule.test(value)
                    validate(inputElement, rule);
                };

                // when user entering input
                inputElement.oninput = function () {
                    var errorElement = parentE.querySelector(
                        options.errorSelector
                    );

                    errorElement.innerText = "";
                    parentE.classList.remove("invalid");
                };
            });
        });
    }
}

// define rules

// Principle of rules:
// 1. When error -> return message `announce error`
// 2. When valid -> return nothing (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        // kiểm tra tính hợp lệ của data mà user nhập vào
        test: function (value) {
            // trim(): reject all spaces: value.trim()
            return value ? undefined : message || "Vui lòng nhập trường này";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        // kiểm tra tính hợp lệ của email mà user nhập vào
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)
                ? undefined
                : message || "Trường này phải là email";
        },
    };
};

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        // kiểm tra tính hợp lệ của data mà user nhập vào
        test: function (value) {
            return value.length >= min
                ? undefined
                : message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        },
    };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue()
                ? undefined
                : message || "Dữ liệu nhập vào không chính xác";
        },
    };
};
