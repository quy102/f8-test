// `Validator` Object
function Validator(options) {
    // lấy element (hay '#form-1')
    var formElement = document.querySelector(options.form);

    // execute `validate`
    function validate(inputElement, rule) {
        var errorMessage = rule.test(inputElement.value);
        var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
        );

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add("invalid");
        } else {
            errorElement.innerText = "";
            inputElement.parentElement.classList.remove("invalid");
        }
    }

    // kiểm tra nếu có form đó thì:
    if (formElement) {
        // options.rules is an array
        options.rules.forEach((rule) => {
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
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        // kiểm tra tính hợp lệ của data mà user nhập vào
        test: function (value) {
            // trim(): reject all spaces
            return value.trim() ? undefined : "Vui lòng nhập trường này";
        },
    };
};

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        // kiểm tra tính hợp lệ của email mà user nhập vào
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Trường này phải là email";
        },
    };
};

Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        // kiểm tra tính hợp lệ của data mà user nhập vào
        test: function (value) {
            return value.length >= min
                ? undefined
                : `Vui lòng nhập tối thiểu ${min} kí tự`;
        },
    };
};
