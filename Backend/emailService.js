const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email configuration missing: SMTP_USER and SMTP_PASS must be set in .env file');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password or app password
    },
  });
};

/**
 * Send email notification when a room is assigned to a student
 */
const sendRoomAssignmentEmail = async (student, room, building, floor) => {
  try {
    if (!student.email) {
      console.log(`No email found for student ${student.name}, skipping email notification`);
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Nursing Project Automation" <${process.env.SMTP_USER}>`,
      to: student.email,
      subject: 'Room Assignment Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Room Assignment Confirmation</h2>
          <p>Dear ${student.name} ${student.lastName || ''},</p>
          <p>You have been assigned to a room. Here are the details:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Building:</strong> Building ${building?.number_build || building?.build_number || 'N/A'}</p>
            <p><strong>Floor:</strong> Floor ${floor?.number_floor || 'N/A'}</p>
            <p><strong>Room:</strong> Room ${room?.number_room || 'N/A'}</p>
            <p><strong>Room Capacity:</strong> ${room?.capacity || 'N/A'}</p>
          </div>
          <p>If you have any questions, please contact the administration.</p>
          <p>Best regards,<br>Nursing Project Administration</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Room assignment email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending room assignment email:', error);
    // Don't throw error - email failure shouldn't break the assignment
    return null;
  }
};

/**
 * Send email notification when a shift is assigned to a supervisor
 */
const sendShiftAssignmentEmail = async (supervisor, shift, building, floor) => {
  try {
    if (!supervisor.email) {
      console.log(`No email found for supervisor ${supervisor.name}, skipping email notification`);
      return;
    }

    const transporter = createTransporter();

    // Format date
    const shiftDate = new Date(shift.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const mailOptions = {
      from: `"Nursing Project Automation" <${process.env.SMTP_USER}>`,
      to: supervisor.email,
      subject: 'Shift Assignment Notification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">Shift Assignment Confirmation</h2>
          <p>Dear ${supervisor.name},</p>
          <p>You have been assigned a new shift. Here are the details:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date:</strong> ${shiftDate}</p>
            <p><strong>Time:</strong> ${shift.start_time} - ${shift.end_time}</p>
            <p><strong>Building:</strong> Building ${building?.number_build || building?.build_number || 'N/A'}</p>
            <p><strong>Floor:</strong> Floor ${floor?.number_floor || 'N/A'}</p>
            ${shift.note ? `<p><strong>Note:</strong> ${shift.note}</p>` : ''}
          </div>
          <p>Please make sure to arrive on time for your shift.</p>
          <p>If you have any questions or need to make changes, please contact the administration.</p>
          <p>Best regards,<br>Nursing Project Administration</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Shift assignment email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending shift assignment email:', error);
    // Don't throw error - email failure shouldn't break the assignment
    return null;
  }
};

module.exports = {
  sendRoomAssignmentEmail,
  sendShiftAssignmentEmail,
};

