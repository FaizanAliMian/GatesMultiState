import wixData from 'wix-data';
import wixLocation from 'wix-location';
import { sendEmailToUser, sendEmailToAdmin } from 'backend/sendMail.web.js';
let payLoad = {};
let selectedGateStyle;
let stateHistory = [];
let selectedDesignGate = "";
let selectedOptionalItems = [];
let selectedIntercomItems = [];

$w.onReady(function () {

    $w("#repeater4").forEachItem(($item, itemdata) => {
        $item("#container6").onClick(() => {
            console.log("this is the text of the selected container :", $item("#text").text);
            $w("#repeater4").forEachItem(($items) => {
                $items("#text").style.color = "#000000"
            });
            $item("#text").style.color = "#496E83"
            selectedGateStyle = $item("#text").text;

        });
    })

    stateHistory = ["gatestyle"];

    if (stateHistory[stateHistory.length - 1] === "additional") {
        updateUIForAdditionalState();
    }

});

function updateUIForAdditionalState() {
    if (!payLoad.gateStyle) {
        console.error("Gate style not set in payload. Cannot update UI.");
        return;
    }

    if (payLoad.gateStyle === "Traditional Swing Gate") {
        configureSwingStyleUI();
    } else if (payLoad.gateStyle === "Sliding Track Gate") {
        configureSlideStyleUI();
    } else {
        console.log("UI configuration not applicable for this gate style:", payLoad.gateStyle);
    }
}

async function changeState(stateId) {
    if (stateHistory[stateHistory.length - 1] !== stateId) {
        stateHistory.push(stateId);
        console.log("State history:", stateHistory);
        await $w("#multistatebox").changeState(stateId);

        // Trigger UI update for the "additional" state
        if (stateId === "additional") {
            updateUIForAdditionalState();
        }
    } else {
        console.log(`State ${stateId} is already the current state.`);
    }
}

async function goToPreviousState() {
    if (stateHistory.length > 1) {
        stateHistory.pop(); // Remove the current state
        const previousState = stateHistory[stateHistory.length - 1]; // Get the last visited state
        console.log("Navigating to previous state:", previousState);
        await $w("#multistatebox").changeState(previousState);
    } else {
        console.log("No previous state to navigate to.");
    }
}

const stateTransitions = {
    "Rising Bollards": "summery",
    "Cantilever Gate": "summery",
    "Commercial Barriers": "summery",
    "Traditional Farm Style Gate": "summery",
    "Traditional Swing Gate": "operationtype",
    "Sliding Track Gate": "operationtype",

};

$w("#gateStyleRepeater").forEachItem(($item, itemdata) => {
    $item("#container").onClick(() => {
        payLoad = {}; // empty payload;  
        selectedDesignGate = "";
        console.log("this is the text of the selected container :", $item("#text").text);
        $w("#gateStyleRepeater").forEachItem(($items) => {
            $items("#text").style.color = "#000000"
        });
        $item("#text").style.color = "#496E83"
        selectedGateStyle = $item("#text").text;

        payLoad.gateStyle = selectedGateStyle;

        // Reset conflicting sections in the payload based on the new selection
        if (selectedGateStyle === "Traditional Swing Gate") {
            delete payLoad.onlyforslide; // Remove Slide-related data
            console.log("Payload updated for Swing Gate. Removed slide data:", payLoad);
        } else if (selectedGateStyle === "Sliding Track Gate") {
            delete payLoad.onlyforswing; // Remove Swing-related data
            console.log("Payload updated for Slide Gate. Removed swing data:", payLoad);
        }
        hideError("gatestyle");
    });
})

$w('#nextbtn').onClick(async (event) => {
    if (!selectedGateStyle) {
        // Show error if no gate style is selected
        showError("gatestyle", "Please select a gate style before proceeding.");
        return;
    }
    await changeState("gatematerial")

});

$w('#gateMaterialNextBtn').onClick(async (event) => {
    console.log("the button is clicked ");
    const selectedgateMaterial = $w("#radioGroup2").value;
    if (selectedgateMaterial) {
        hideError("gatematerial");
        payLoad.gateMaterial = selectedgateMaterial;
        console.log("payLoad updated :", payLoad);

        const gateDesigns = await queryGateDesigns(payLoad.gateStyle, payLoad.gateMaterial);
        console.log("these are the gate designs fetched:", gateDesigns);

        if (gateDesigns.length > 0) {
            populateGateDesignRepeater(gateDesigns);
        } else {
            console.log("No matching gate designs found.");
            populateGateDesignRepeater([]);
        }

        await changeState("gatedesign")
    } else {
        showError("gatematerial", "Please select a gate material before proceeding.");
    }
})

async function queryGateDesigns(gateStyle, gateMaterial) {
    return wixData.query("GateDesignandPricing")
        .hasAll("gateStyle", [gateStyle])
        .hasAll("gateMaterial", [gateMaterial])
        .find()
        .then((results) => results.items)
        .catch((error) => {
            console.error("Error querying database:", error);
            return [];
        });
}

function populateGateDesignRepeater(gateDesigns) {

    $w("#gateDesignRepeater").data = gateDesigns;

    $w("#gateDesignRepeater").onItemReady(($item, itemData) => {
        $item("#gateDesignImage").src = itemData.gateImage;
        $item("#gateDesignName").text = itemData.gateName;
        $item("#gateDesignPrice").text = `£${itemData.gatePrice.toFixed(2)}`;

        $item("#container2").onClick(() => {

            console.log("Selected Gate Design:", itemData.gateName);
            console.log("Selected Gate Price:", itemData.gatePrice);
            selectedDesignGate = itemData.gateName;
            // Store the selected design and price in payLoad 
            payLoad.gateDesign = itemData.gateName;
            payLoad.gateDesignPrice = itemData.gatePrice;

            console.log("Payload updated:", payLoad);

            // Optional: Add visual feedback for selection
            $w("#gateDesignRepeater").forEachItem(($otherItem) => {
                $otherItem("#gateDesignName").style.color = "#ffffff"; // Reset all items
            });
            $item("#gateDesignName").style.color = "#496E83"; // Highlight selected item
        });

    });
    $w('#gateDesignNextBtn').onClick(async (event) => {
        console.log("Selected Design = ", selectedDesignGate);
        if (selectedDesignGate === "") {
            showError("gatedesign", "Please select a gate design before proceeding.");
            console.log("No gate design selected. Please select one.");
            return;
        } else {
            hideError("gatedesign");
        }

        const nextState = stateTransitions[payLoad.gateStyle];
        if (nextState === "summery") {
            console.log("Directly transitioning to summary.");
            populateSummaryRepeater();
            await changeState("summery");
        } else if (nextState === "operationtype") {
            console.log("Transitioning to operation type.");
            await changeState("operationtype");
        } else {
            console.error("Unexpected state transition.");
        }

    });

}

$w('#operationTypeNextBtn').onClick(async (event) => {
    const selectedgateOperationType = $w("#radioGroup3").value;

    if (selectedgateOperationType) {
        payLoad.gateOperationType = selectedgateOperationType;
        console.log("Payload updated with gate operation type:", payLoad);

        if (payLoad.gateStyle === "Traditional Swing Gate") {
            await changeState("onlyforswing");
        } else if (payLoad.gateStyle === "Sliding Track Gate") {
            await changeState("onlyforslide");
        } else {
            console.error("Unexpected gate style or operation type");
        }
        await gettingOptionalsItems();
    } else {
        console.error("No operation type selected.");
    }
});

$w('#onlyForSwingNextBtn').onClick(async (event) => {
    const conditionalOtptionsSwings = $w("#radioGroup4").value;
    const pricesconditionalOtptionsSwings = 2000;
    if (conditionalOtptionsSwings) {
        payLoad.onlyforswing = {
            optionSwing: conditionalOtptionsSwings,
            price: pricesconditionalOtptionsSwings
        };
        console.log("updated Pauload : ", payLoad);
        await changeState("additional");
    } else {
        console.log("please Select one option");
    }

});
$w('#onlyForSlideNextBtn').onClick(async (event) => {
    const conditionalOtptionsSlides = $w("#radioGroup6").value;
    const priceconditionalOtptionsSlides = 1700;
    if (conditionalOtptionsSlides) {
        payLoad.onlyforslide = {
            optionSlide: conditionalOtptionsSlides,
            priceSlide: priceconditionalOtptionsSlides

        }
        console.log("updated Pauload : ", payLoad);
        await changeState("additional")
    } else {
        console.log("please Select one option");
    }

});
$w('#additionalNextBtn').onClick(async (event) => {
    try {
        // Initialize with null to represent "Deselect" state

        const qty = Number($w("#input1").value) || 1;
        const photoCellPrice = 250 * qty;

        if (payLoad.gateStyle === "Traditional Swing Gate") {
            payLoad.safetyRequirements = {
                photoCells: photoCellPrice,
                safetyEdge: 750, // Predefined price for swing
                OptionalItems: selectedOptionalItems,
            };
        } else if (payLoad.gateStyle === "Sliding Track Gate") {
            payLoad.safetyRequirements = {
                photoCells: photoCellPrice,
                safetyEdge: 890, // Predefined price for slide
                OptionalItems: selectedOptionalItems,
            };
        }

        console.log("Updated Payload for Additional State:", payLoad);
        await changeState("intercom");
    } catch (error) {
        console.error("Error in additional state:", error);
        showError1("An error occurred. Please try again.");
    }

});

function configureSwingStyleUI() {
    $w("#infinityHingesContainer").expand(); // Show infinity hinges container
    $w("#safetyEdgeLabel").text = "Safety edge price for swing gates estimated at 3 for this type of gate";
    $w("#safetyEdgePrice").text = "£750";
    $w("#photoCellsLabel").text = "Set of photocells for swing-style gates";
    $w("#input1").value = "1";
    console.log("Swing gate UI configured.");
}

// Configure UI for Slide Style Gates
function configureSlideStyleUI() {
    $w("#infinityHingesContainer").collapse(); // Hide infinity hinges container
    $w("#safetyEdgeLabel").text = "Safety edge price for slide gates estimated at 3 for this type of gate";
    $w("#safetyEdgePrice").text = "£890";
    $w("#photoCellsLabel").text = "Set of photocells for slide-style gates";
    $w("#input1").value = "2";
    $w("#input1").onInput(() => {
        let currentValue = parseInt($w("#input1").value, 10);
        if (isNaN(currentValue) || currentValue < 2) {
            $w("#input1").value = "2"; // Reset to 2 if the value is invalid or less than 2
        }
    });
    console.log("Slide gate UI configured.");
}

$w('#gateMaterialPrevBtn').onClick(async (event) => await goToPreviousState());
$w('#gateDesignPrevBtn').onClick(async (event) => await goToPreviousState());
$w('#operationTypePrevBtn').onClick(async (event) => await goToPreviousState());
$w('#onlyForSwingPrevBtn').onClick(async (event) => await goToPreviousState());
$w('#onlyForSlidePrevBtn').onClick(async (event) => await goToPreviousState());
$w('#additionalPrevBtn').onClick(async (event) => await goToPreviousState());
$w('#intercomPrevBtn').onClick(async (event) => await goToPreviousState());
$w('#summeryPrevBtn').onClick(async (event) => await goToPreviousState());
$w('#surveryPrevBtn').onClick(async (event) => await goToPreviousState());

async function gettingOptionalsItems() {
    try {
        const response = await wixData.query("OptionalItems").find();
        if (response.items.length > 0) {
            $w('#repeater3').data = response.items
        } else {
            $w('#repeater3').data = [];
            console.log("there is no Data");
        }

    } catch (error) {
        console.log("Error while getting the Optional Items :", error);
    }
}

$w('#repeater3').onItemReady(($items, itemData) => {
    $items("#image26").src = itemData.itemImage;
    $items("#text201").text = itemData.itemName;
    $items("#text200").text = `£${itemData.price.toFixed(2)}`;

    // Initialize with default colors
    const defaultTextColor = "#000000"; // Black
    const selectedTextColor = "#496E83"; // Red (example)

    // Add click event for the container
    $items("#container3").onClick(() => {
        const selectedItem = {
            name: itemData.itemName,
            price: itemData.price
        };

        // Check if the item is already in the selectedOptionalItems array
        const existingIndex = selectedOptionalItems.findIndex(
            item => item.name === selectedItem.name && item.price === selectedItem.price
        );

        if (existingIndex > -1) {
            // Deselect the item
            selectedOptionalItems.splice(existingIndex, 1);

            // Reset text colors to default
            $items("#text201").style.color = defaultTextColor;
            $items("#text200").style.color = defaultTextColor;
        } else {
            // Select the item
            selectedOptionalItems.push(selectedItem);

            // Change text colors to indicate selection
            $items("#text201").style.color = selectedTextColor;
            $items("#text200").style.color = selectedTextColor;
        }

        console.log("Selected optional items:", selectedOptionalItems);
    });

});

$w("#intercomRepeater").forEachItem(($item, itemData) => {
    // Initialize with default colors
    const defaultTextColor = "#000000"; // Black
    const selectedTextColor = "#496E83"; // Highlight color

    // Add click event for the container
    $item("#container4").onClick(() => {
        const selectedItem = {
            name: $item("#textElement").text, // Replace with your actual ID
            price: parseFloat($item("#priceElement").text.replace(/[^0-9.]/g, '')), // Extract numeric part
        };

        if (selectedIntercomItems.length > 0) {
            // Reset all other items in the repeater
            $w("#intercomRepeater").forEachItem(($otherItem) => {
                $otherItem("#textElement").style.color = defaultTextColor;
                $otherItem("#priceElement").style.color = defaultTextColor;
            });

            // Clear the previously selected item
            selectedIntercomItems = [];
        }

        // Select the new item
        selectedIntercomItems.push(selectedItem);

        // Change text colors to indicate selection
        $item("#textElement").style.color = selectedTextColor;
        $item("#priceElement").style.color = selectedTextColor;

        // Update the payload
        payLoad.selectedIntercomItems = selectedIntercomItems[0]; // Store only the selected item
        console.log("Payload updated with intercom items:", payLoad);
    });
});

$w('#intercomNextBtn').onClick(async (event) => {
    if (payLoad.gateStyle !== "Traditional Swing Gate") {
        delete payLoad.onlyforswing;
    }
    if (payLoad.gateStyle !== "Sliding Track Gate") {
        delete payLoad.onlyforslide;
    }

    console.log("Payload cleaned up for summery state:", payLoad);
    populateSummaryRepeater();
    await changeState("summery");
});

function populateSummaryRepeater() {
    const summaryData = transformPayloadToRepeaterData();
    const totalPrice = calculateTotalPrice(); // Calculate the total price

    // Update the repeater with summary data
    $w("#summaryRepeater").data = summaryData;

    $w("#summaryRepeater").onItemReady(($item, itemData) => {
        $item("#itemName").text = itemData.name; // Static name
        $item("#itemValue").text = itemData.value || ""; // User's selection
        $item("#itemPrice").text = itemData.price ? `Estimated Price: £${itemData.price}` : ""; // Price (if applicable)

        if (itemData.qty) {
            $item('#qty').show();
            $item('#qty').text = "Qty: " + itemData.qty;
        } else {
            $item('#qty').hide();
        }
    });

    // Display the total price in the title element
    $w("#totalPriceTitle").text = `Estimated Total Price: £${totalPrice}`;
}

function transformPayloadToRepeaterData() {
    const data = [];
    let uniqueId = 1; // Counter for generating unique IDs

    // Add simple key-value pairs
    if (payLoad.gateStyle) {
        data.push({ _id: String(uniqueId++), name: "Gate Style", value: payLoad.gateStyle });
    }
    if (payLoad.gateMaterial) {
        data.push({ _id: String(uniqueId++), name: "Gate Material", value: payLoad.gateMaterial });
    }
    if (payLoad.gateDesign) {
        data.push({
            _id: String(uniqueId++),
            name: "Gate Design",
            value: payLoad.gateDesign,
            price: payLoad.gateDesignPrice
        });
    }
    if (payLoad.gateOperationType) {
        data.push({ _id: String(uniqueId++), name: "Operation Type", value: payLoad.gateOperationType });
    }

    // Add safety requirements (if available)
    const safetyRequirements = payLoad.safetyRequirements || {};
    if (safetyRequirements.photoCells) {
        data.push({
            _id: String(uniqueId++),
            name: "Photo Cells",
            value: "Included",
            price: safetyRequirements.photoCells,
            qty: $w("#input1").value
        });
    }
    if (safetyRequirements.safetyEdge) {
        data.push({
            _id: String(uniqueId++),
            name: "Safety Edge",
            value: "Included",
            price: safetyRequirements.safetyEdge
        });
    }

    // Add optional items (if available)
    const optionalItems = safetyRequirements.OptionalItems || [];
    optionalItems.forEach(item => {
        data.push({
            _id: String(uniqueId++),
            name: `Optional Item: ${item.name}`,
            value: "Included",
            price: item.price
        });
    });

    // Add selected intercom items (if available)
    if (payLoad.selectedIntercomItems) {
        data.push({
            _id: String(uniqueId++),
            name: "Intercom",
            value: payLoad.selectedIntercomItems.name,
            price: payLoad.selectedIntercomItems.price
        });
    }

    // Add Swing or Slide-specific data (if applicable)
    if (payLoad.onlyforswing) {
        data.push({
            _id: String(uniqueId++),
            name: "Swing Gate Option",
            value: payLoad.onlyforswing.optionSwing,
            price: payLoad.onlyforswing.price
        });
    }
    if (payLoad.onlyforslide) {
        data.push({
            _id: String(uniqueId++),
            name: "Slide Gate Option",
            value: payLoad.onlyforslide.optionSlide,
            price: payLoad.onlyforslide.priceSlide
        });
    }

    // Add Total Price
    const totalPrice = calculateTotalPrice();
    data.push({
        _id: String(uniqueId++),
        name: " Estimated Total Price",
        value: "",
        price: totalPrice
    });

    return data;
}

function calculateTotalPrice() {
    let total = 0;

    // Add gate design price
    total += payLoad.gateDesignPrice || 0;

    // Add safety requirements prices (if available)
    const safetyRequirements = payLoad.safetyRequirements || {};
    total += safetyRequirements.photoCells || 0;
    total += safetyRequirements.safetyEdge || 0;

    // Add optional items prices (if available)
    const optionalItems = safetyRequirements.OptionalItems || [];
    optionalItems.forEach(item => total += item.price);

    // Add intercom price (if available)
    total += (payLoad.selectedIntercomItems?.price || 0);

    // Add Swing or Slide gate prices (if available)
    if (payLoad.onlyforswing) {
        total += payLoad.onlyforswing.price || 0;
    }
    if (payLoad.onlyforslide) {
        total += payLoad.onlyforslide.priceSlide || 0;
    }

    return total;
}

$w('#summeryNextBtn').onClick(async (event) => {
    await changeState("surevy")

})

$w("#submitSurveyButton").onClick(async () => {
    await handleSurveySubmission();
    setTimeout(() => {
        wixLocation.to("https://www.gateaccesssolutions.co.uk/");
    }, 4000);

});

async function handleSurveySubmission() {

    try {
        // Collect data from input fields
        const surveyData = {
            name: $w("#nameInput").value,
            email: $w("#emailInput").value,
            phone: $w("#phoneInput").value,
            country: $w("#countryInput").value,
            state: $w("#stateInput").value,
            address: $w("#addressInput").value,
            message: $w("#messageInput").value,
        };
        let isValid = true;

        if (!surveyData.name) {
            showError1("Name is required.");
            isValid = false;
        } else if (!surveyData.email) {
            showError1("Email is required.");
            isValid = false;
        } else if (!validateEmail(surveyData.email)) {
            showError1("Invalid email format.");
            isValid = false;
        } else if (!surveyData.phone) {
            showError1("Phone number is required.");
            isValid = false;
        } else if (!surveyData.country) {
            showError1("Country is required.");
            isValid = false;
        } else if (!surveyData.state) {
            showError1("State is required.");
            isValid = false;
        } else if (!surveyData.address) {
            showError1("Address is required.");
            isValid = false;
        } else {
            hideError1(); // Hide error if all fields are valid
        }

        // Stop execution if validation fails
        if (!isValid) {
            return;
        }

        const fullSubmissionData = {
            ...surveyData,
            userSelection: payLoad, // Add the entire payload to the CMS entry
        };

        console.log("Data to insert:", fullSubmissionData);

        // Insert data into the SurveyResponses collection
        const result = await wixData.insert("SurveyResponses", fullSubmissionData);
        console.log("Survey data saved successfully:", result);

        const userObject = {
            name: surveyData.name,
            email: surveyData.email,
            phone: surveyData.phone,
            country: surveyData.country,
            state: surveyData.state,
            address: surveyData.address,
            message: surveyData.message || "No message provided",
            userSelection: formatUserSelection(payLoad),
        };

        const emailTemplateId = "UYuOigR";
        try {
            await sendEmailToUser(userObject, emailTemplateId);
            console.log("Triggered email sent successfully to user.");

        } catch (error) {
            console.error("Error sending email to user:", error);
        }

        const emailTemplateIdAdmin = "UYuOlo9";
        try {
            await sendEmailToAdmin(userObject, emailTemplateIdAdmin);
            console.log("Triggered email sent successfully to admin.");

        } catch (error) {
            console.error("Error sending email to admin:", error);
        }

        // Show success message or navigate to a different state
        $w("#successMessage").text = "Thank you! Your survey has been submitted.";
        $w("#successMessage").show();

        // Optionally clear the form
        clearSurveyForm();
    } catch (error) {
        console.error("Error while saving survey data:", error);
        showError("An error occurred. Please try again later.");
    }
}

function formatUserSelection(userSelection) {
    const {
        selectedIntercomItems,
        gateStyle,
        gateMaterial,
        gateDesign,
        gateOperationType,
        gateDesignPrice,
        onlyforswing,
        onlyforslide,
        safetyRequirements
    } = userSelection;

    let formattedSelection = '';
    let totalPrice = 0;

    // Arrange data in a logical pattern
    if (gateStyle) {
        formattedSelection += `Gate Style: ${gateStyle}\n`;
    }
    if (gateMaterial) {
        formattedSelection += `Gate Material: ${gateMaterial}\n`;
    }
    if (gateDesign) {
        formattedSelection += `Gate Design: ${gateDesign}\n`;
    }
    if (gateOperationType) {
        formattedSelection += `Gate Operation Type: ${gateOperationType}\n`;
    }
    if (gateDesignPrice) {
        formattedSelection += `Gate Design Price: Estimated £${gateDesignPrice}\n`;
        totalPrice += gateDesignPrice;
    }
    if (selectedIntercomItems) {
        formattedSelection += `Intercom: ${selectedIntercomItems.name}, Estimated Price: £${selectedIntercomItems.price}\n`;
        totalPrice += selectedIntercomItems.price;
    }

    // Add Swing or Slide options based on availability
    if (onlyforswing) {
        formattedSelection += `Swing Option: ${onlyforswing.optionSwing}, Estimated Price: £${onlyforswing.price}\n`;
        totalPrice += onlyforswing.price;
    }
    if (onlyforslide) {
        formattedSelection += `Slide Option: ${onlyforslide.optionSlide}, Estimated Price: £${onlyforslide.priceSlide}\n`;
        totalPrice += onlyforslide.priceSlide;
    }

    // Safety Requirements
    if (safetyRequirements) {
        formattedSelection += `Safety Requirements:\n`;
        formattedSelection += `  - PhotoCells: Estimated £${safetyRequirements.photoCells}\n`;
        formattedSelection += `  - Safety Edge: Estimated £${safetyRequirements.safetyEdge}\n`;
        totalPrice += safetyRequirements.photoCells + safetyRequirements.safetyEdge;
        safetyRequirements.OptionalItems.forEach(item => {
            formattedSelection += `  - ${item.name}, Estimated Price: £${item.price}\n`;
            totalPrice += item.price;
        });
    }

    // Add Estimated Total Price
    formattedSelection += `\nEstimated Total Price: £${totalPrice}`;

    return formattedSelection.trim(); // Remove trailing newline for better formatting
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function clearSurveyForm() {
    $w("#nameInput").value = "";
    $w("#emailInput").value = "";
    $w("#phoneInput").value = "";
    $w("#countryInput").value = "";
    $w("#stateInput").value = "";
    $w("#addressInput").value = "";
    $w("#messageInput").value = "";
}

function showError(stateId, message) {
    const errorElementId = `#${stateId}ErrorText`; // Assumes the error text element ID follows this pattern
    const errorElement = $w(errorElementId);

    if (errorElement) {
        errorElement.text = message; // Set the error message
        errorElement.show(); // Display the error text 
        setTimeout(() => {
            errorElement.hide();
        }, 3000); // 3000 milliseconds = 3 seconds
    } else {
        console.error(`Error element not found for state: ${stateId}`);
    }
}

function hideError(stateId) {
    const errorElementId = `#${stateId}ErrorText`; // Assumes the error text element ID follows this pattern
    const errorElement = $w(errorElementId);

    if (errorElement) {
        errorElement.hide(); // Hide the error text   

    } else {
        console.error(`Error element not found for state: ${stateId}`);
    }
}

function showError1(message) {
    const errorElement = $w("#errorText");

    if (errorElement) {
        errorElement.text = message; // Set the error message
        errorElement.show(); // Display the error text
    } else {
        console.error("Error element not found: #errorText");
    }
}

function hideError1() {
    const errorElement = $w("#errorText");

    if (errorElement) {
        errorElement.hide(); // Hide the error text
    } else {
        console.error("Error element not found: #errorText");
    }
}
