const Contact = require('../models/Contact');
const sendEmail = require('../utils/sendEmail');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Please provide all fields' });
        }

        const contact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Your query has been submitted successfully. We will get back to you soon!',
            data: contact
        });
    } catch (error) {
        console.error('Contact submit error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all contact queries
// @route   GET /api/admin/contacts
// @access  Admin only
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reply to a contact query
// @route   POST /api/admin/contacts/:id/reply
// @access  Admin only
const replyToContact = async (req, res) => {
    try {
        const { reply } = req.body;
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ success: false, message: 'Query not found' });
        }

        if (!reply) {
            return res.status(400).json({ success: false, message: 'Please provide a reply message' });
        }

        // Send Email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #ffffff; color: #333;">
                <div style="text-align: center; border-bottom: 2px solid #0891b2; padding-bottom: 10px; margin-bottom: 20px;">
                    <h2 style="color: #0891b2; margin: 0;">Sentinel Cloud Support</h2>
                </div>
                <p>Hello <strong>${contact.name}</strong>,</p>
                <p>Thank you for reaching out to us regarding <strong>"${contact.subject}"</strong>.</p>
                <div style="background-color: #f0f9ff; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; font-style: italic;">
                    "${contact.message}"
                </div>
                <p><strong>Admin Response:</strong></p>
                <p style="white-space: pre-line; line-height: 1.6;">${reply}</p>
                <p style="margin-top: 30px;">Best regards,<br>The Sentinel Cloud Team</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 11px; color: #999; text-align: center;">This is an automated reply. Please do not reply directly to this email.</p>
            </div>
        `;

        await sendEmail({
            email: contact.email,
            subject: `RE: ${contact.subject} - Sentinel Cloud Support`,
            message: reply,
            html: emailHtml
        });

        // Update database
        contact.status = 'resolved';
        contact.adminReply = reply;
        contact.repliedAt = Date.now();
        await contact.save();

        res.status(200).json({
            success: true,
            message: 'Reply sent successfully and query marked as resolved'
        });
    } catch (error) {
        console.error('Contact reply error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    submitContact,
    getAllContacts,
    replyToContact
};
