import { getDoc, updateDoc, doc } from '../../firebase-lib/firebase-firestore.js'
import { updatePassword } from '../../firebase-lib/firebase-auth.js'
import { db, auth } from '../../firebase.js'

export function init() {
    const authUser = auth.currentUser;
    console.log(authUser)
    
    const userDoc = doc(db, "users", localStorage.piccleUID);
    const formInfo = document.querySelector('.info-section > form');
    let userInfo = null;
    
    // Show user information in UI
    const saveBtn = document.querySelector('.account-buttons .btn-save');
    getDoc(userDoc)
        .then(res => {
            userInfo = res.data();
            formInfo.firstName.value = userInfo.firstname;
            formInfo.lastName.value = userInfo.lastname;
            formInfo.email.value = userInfo.user_email;
            if (! userInfo.providerIDs.includes("password")) {
                formInfo.password.disabled = true;
            }

            // Change social buttons to show user's social auth providers
            const socialSection = document.querySelector('.social-section');
            if ( userInfo.providerIDs.includes("google.com") ) {
                socialSection.querySelector(".btn-google button").classList.remove("btn-primary");
                socialSection.querySelector(".btn-google button").classList.add("btn-secondary");
                socialSection.querySelector(".btn-google button").innerHTML = "Disconnect";
            }

            if ( userInfo.providerIDs.includes("twitter.com") ) {
                socialSection.querySelector(".btn-twitter button").classList.remove("btn-primary");
                socialSection.querySelector(".btn-twitter button").classList.add("btn-secondary");
                socialSection.querySelector(".btn-twitter button").innerHTML = "Disconnect";
            }

            if ( userInfo.providerIDs.includes("facebook.com") ) {
                socialSection.querySelector(".btn-facebook button").classList.remove("btn-primary");
                socialSection.querySelector(".btn-facebook button").classList.add("btn-secondary");
                socialSection.querySelector(".btn-facebook button").innerHTML = "Disconnect";
            }
            
            saveBtn.addEventListener('click', e => {
                e.preventDefault();
                updateUserInfo(userInfo);
            })
        })
        .catch(err => {console.log(err.message)});
    
    // Add click listener to cancel that brings user back to settings
    const cancelBtn = document.querySelector('.account-buttons .btn-cancel');
    cancelBtn.addEventListener('click', e => {
        e.preventDefault();
        window.location.hash = 'settings';
    })
    
    // Function: upload the updated user information and password.
    function updateUserInfo (userInfoObj) {
    
        const formUserInfoValues = [
            ["firstname", formInfo.firstName.value],
            ["lastname", formInfo.lastName.value],
            ["user_email", formInfo.email.value],
        ];
    
        const toUpdateObj = {};
    
        formUserInfoValues.forEach(sublist => {
            if (userInfoObj[sublist[0]] !== sublist[1]) {
                toUpdateObj[sublist[0]] = sublist[1];
            }
        });
    
        if (Object.keys(toUpdateObj).length > 0) {
                showPopup("Confirm Info Change", "This will change your user information. Proceed?");
                document.querySelector('.popup-proceed').addEventListener("click", e => {
                    updateDoc(userDoc, toUpdateObj);
                    document.querySelector(".account-wrapper__overlay").classList.remove("show");
                    window.location.hash = 'settings';
                })
            } else {
                showPopup("No Change", "<p>No change in user information was entered.</p><p>Please enter new information to save.</p>");
                document.querySelector('.popup-proceed').addEventListener("click", e => {
                    document.querySelector(".account-wrapper__overlay").classList.remove("show");
                })
            }
        
        if (formInfo.password.value !== "") {
            if (formInfo.password.value.length >= 6) {
                showPopup("Confirm Password Change", "<p>Your password will be changed. Proceed?</p>");
                document.querySelector('.popup-proceed').addEventListener("click", e => {
                    updatePassword(authUser, formInfo.password.value)
                    .then(() => {
                        formInfo.password.value = "";
                    })
                    .catch(err => {console.log(err.message)});
                })
            } else {
                showPopup("Password Not Changed", "<p>Your password will be changed. Proceed?</p>");
                document.querySelector('.popup-proceed').addEventListener("click", e => {
                    document.querySelector(".account-wrapper__overlay").classList.remove("show");
                })
            }
        }
    }
    
    /* BUTTON FUNCTIONS ========================================= */
    // Open popup
    function showPopup (title, message) {
        document.querySelector(".popup-icon").src = "./../images/icons/warning.svg"
        document.querySelector(".popup-message").innerHTML = message;
    
        document.querySelector(".popup-title").innerHTML = title;
        document.querySelector(".account-wrapper__overlay").classList.add("show");
    };
    
    
    
    // Purchase Successful Popup
    function successPopup (name, price) {
        document.querySelector(".popup-title").innerHTML = `Purchase Successful`;
        document.querySelector(".popup-cancel").innerHTML = `Close`;
        document.querySelector(".popup-purchase").classList.remove("show");
        };
    
    // Close popup
    document.querySelector(".popup-cancel").addEventListener("click", () => {
        document.querySelector(".account-wrapper__overlay").classList.remove("show");
        document.querySelector(".popup-title").innerHTML = `Message Here`;
        document.querySelector(".popup-message").innerHTML = ``;
    });
    
    /* END BUTTON FUNCTIONS ========================================= */
}

