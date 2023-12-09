// `Validator` Object
function Validator(options) {
    // create an object contains all rules (avoid overwriting)
    var selectorRules = {};

    // lấy element (hay '#form-1')
    var formElement = document.querySelector(options.form);

    // execute `validate`
    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
        );
        var errorMessage;

        var rules = selectorRules[rule.selector];

        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove("invalid");
        }

        return !errorMessage;
    }

    // kiểm tra nếu có form đó thì:
    if (formElement) {
        // when submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            // kiểm tra form đúng hết dữ liệu để đưa tất cả vào 1 object trong data sau này
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
                        "[name]:not([disable])"
                    );

                    var formValues = Array.from(enableInputs).reduce(function (
                        values,
                        input
                    ) {
                        // name: attribute of input element, dif from others
                        return (values[input.name] = input.value) && values; // return values
                    },
                    {});

                    options.onSubmit(formValues);
                    console.log(enableInputs);
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
            var inputElement = formElement.querySelector(rule.selector); // selector được truyền vào hàm

            // kiểm tra ở trong #form-1 có tồn tại inputElement (#fullname, #email,...) thì onblur:
            if (inputElement) {
                // when blur out input
                inputElement.onblur = function () {
                    // value: inputElement.value
                    // test: rule.test(value)
                    validate(inputElement, rule);
                };

                // when user entering input
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(
                        options.errorSelector
                    );

                    errorElement.innerText = "";
                    inputElement.parentElement.classList.remove("invalid");
                };
            }
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
            // trim(): reject all spaces
            return value.trim()
                ? undefined
                : message || "Vui lòng nhập trường này";
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
