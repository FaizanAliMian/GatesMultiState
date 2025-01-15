import { Permissions, webMethod } from 'wix-web-module';
import { contacts, triggeredEmails } from 'wix-crm-backend';

export const sendEmailToUser = webMethod(Permissions.Anyone, async (userData, emailTempId) => {
    try {
        const { email } = userData;
        let contactId;
        const queryResults = await contacts.queryContacts()
            .eq('info.emails.email', email)
            .find({ suppressAuth: true });

        if (queryResults.items.length > 0) {
            contactId = queryResults.items[0]._id;
        } else {
            const contactInfo = {
                emails: [{
                    email: email,
                    primary: true
                }]
            };
            const contact = await contacts.createContact(contactInfo, { suppressAuth: true });
            contactId = contact._id;
            console.log("Contact ID:", contactId);
        }

        // Send the triggered email
        await triggeredEmails.emailContact(emailTempId, contactId, {
            variables: {
                ...userData

            },
        });

        console.log('Email sent to User');
        console.log("Backend Parameters:", {
            userData,
        });

    } catch (error) {
        console.error('Error sending email to user:', error);
    }
});

export const sendEmailToAdmin = webMethod(Permissions.Anyone, async (userData, emailTempId) => {
    try {
       const adminContactInfo = {
            emails: [{ email: "wixengine.com@gmail.com", primary: true }]
        };
        let contactId;
        const queryResults = await contacts.queryContacts()
            .eq('info.emails.email', adminContactInfo.emails[0].email)
            .find({ suppressAuth: true });

        if (queryResults.items.length > 0) {
            contactId = queryResults.items[0]._id;
        } else {
            const contact = await contacts.createContact(adminContactInfo, { suppressAuth: true });
            contactId = contact._id;
            console.log("Admin Contact ID:", contactId);
        }

        // Send the triggered email
        await triggeredEmails.emailContact(emailTempId, contactId, {
            variables: {
                ...userData

            },
        });

        console.log('Email sent to admin');
        console.log("Backend Parameters:", {
            userData,
        });

    } catch (error) {
        console.error('Error sending email to admin:', error);
    }
});
