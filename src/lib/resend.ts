import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const emailStyles = {
  container: `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
    background-color: #1a1a1a;
    color: #ffffff;
  `,
  header: `
    text-align: center;
    margin-bottom: 40px;
  `,
  heading: `
    color: #ffffff;
    font-size: 48px;
    margin-bottom: 16px;
    font-weight: 300;
    line-height: 1.2;
  `,
  subheading: `
    color: #9ca3af;
    font-size: 24px;
    margin-bottom: 32px;
    font-weight: 300;
  `,
  promise: `
    font-size: 32px;
    color: #ffffff;
    padding: 24px;
    margin: 32px 0;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    text-align: center;
    font-weight: 300;
    line-height: 1.4;
  `,
  button: `
    display: inline-block;
    background-color: #ffffff;
    color: #000000;
    padding: 16px 48px;
    text-decoration: none;
    border-radius: 9999px;
    margin: 32px 0;
    font-size: 20px;
    text-align: center;
    transition: background-color 0.3s ease;
  `,
  footer: `
    margin-top: 48px;
    padding-top: 32px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    text-align: center;
    color: #9ca3af;
    font-size: 16px;
    line-height: 1.6;
  `
};

export const FROM_EMAIL = 'Promise <promises@yourdomain.com>';

export async function sendWelcomeEmail({ name, email, userId, promise }: {
  name: string;
  email: string;
  userId: string;
  promise: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: `Welcome to Promise, ${name}! Your journey begins now`,
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">Welcome, ${name}</p>
        </div>

        <div style="${emailStyles.promise}">
          ${promise}
        </div>

        <div style="text-align: center;">
          <p style="${emailStyles.subheading}">
            every promise plants a seed of change<br>
            nurture it with your actions today
          </p>

          <a href="${appUrl}/dashboard/${userId}" style="${emailStyles.button}">
            View Dashboard
          </a>
        </div>

        <div style="${emailStyles.footer}">
          <p>You'll receive a gentle reminder when it's time for tomorrow's promise.</p>
        </div>
      </div>
    `
  });
}

export async function sendDailyReminder({ name, email, userId }: {
  name: string;
  email: string;
  userId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Time for a New Promise',
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">Hello, ${name}</p>
        </div>

        <div style="text-align: center;">
          <p style="${emailStyles.subheading}">
            A new day brings a new opportunity<br>
            What will you promise yourself today?
          </p>

          <a href="${appUrl}/dashboard/${userId}" style="${emailStyles.button}">
            Make Today's Promise
          </a>
        </div>

        <div style="${emailStyles.footer}">
          <p>Keep growing, one promise at a time.</p>
        </div>
      </div>
    `
  });
}

export async function sendGentleReminder({ name, email, userId, promise, isCompleted }: {
  name: string;
  email: string;
  userId: string;
  promise: string;
  isCompleted: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Don't send if already completed
  if (isCompleted) {
    return null;
  }

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'A gentle reminder about your promise',
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">Hello, ${name}</p>
        </div>

        <div style="${emailStyles.promise}">
          ${promise}
        </div>

        <div style="text-align: center;">
          <p style="${emailStyles.subheading}">
            Like a seed needs water to grow,<br>
            your promise needs your attention today
          </p>

          <a href="${appUrl}/dashboard/${userId}" style="${emailStyles.button}">
            Complete Promise
          </a>
        </div>

        <div style="${emailStyles.footer}">
          <p>Small actions create lasting change. You've got this.</p>
        </div>
      </div>
    `
  });
}

export async function sendCompletionReminder({ name, email, userId, promise, isCompleted }: {
  name: string;
  email: string;
  userId: string;
  promise: string;
  isCompleted: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const subject = isCompleted 
    ? 'Congratulations on completing your promise!' 
    : 'Your promise is ready to be completed';

  const message = isCompleted
    ? `
      <div style="text-align: center;">
        <p style="${emailStyles.subheading}">
          🌱 Your promise has bloomed!<br>
          You've nurtured it to completion
        </p>

        <a href="${appUrl}/dashboard/${userId}" style="${emailStyles.button}">
          View Your Progress
        </a>
      </div>
    `
    : `
      <div style="text-align: center;">
        <p style="${emailStyles.subheading}">
          It's time to harvest your promise<br>
          Complete it before the day ends
        </p>

        <a href="${appUrl}/dashboard/${userId}" style="${emailStyles.button}">
          Complete Now
        </a>
      </div>
    `;

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject,
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">Hello, ${name}</p>
        </div>

        <div style="${emailStyles.promise}">
          ${promise}
        </div>

        ${message}

        <div style="${emailStyles.footer}">
          <p>${isCompleted ? 'Keep growing, one promise at a time.' : 'Every completed promise is a step toward lasting change.'}</p>
        </div>
      </div>
    `
  });
} 

export async function sendPartnerInvitation({ partnerEmail, userName, userEmail, promise, invitationId }: {
  partnerEmail: string;
  userName: string;
  userEmail: string;
  promise: string;
  invitationId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  return resend.emails.send({
    from: 'onboarding@resend.dev',
    to: partnerEmail,
    subject: `${userName} wants you to be their accountability partner`,
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">You've been invited to be an accountability partner</p>
        </div>

        <div style="text-align: center;">
          <p style="${emailStyles.subheading}">
            ${userName} (${userEmail}) has invited you to help them stay accountable to their promise:
          </p>

          <div style="${emailStyles.promise}">
            ${promise}
          </div>

          <p style="${emailStyles.subheading}">
            As their accountability partner, you'll receive notifications when they complete their promise.
          </p>

          <div style="margin: 32px 0;">
            <a href="${appUrl}/accept-invitation/${invitationId}" style="${emailStyles.button}">
              Accept Invitation
            </a>
          </div>

          <div style="margin: 32px 0;">
            <a href="${appUrl}/decline-invitation/${invitationId}" style="
              display: inline-block;
              color: #9ca3af;
              padding: 16px 48px;
              text-decoration: none;
              border: 1px solid #9ca3af;
              border-radius: 9999px;
              font-size: 20px;
              text-align: center;
              transition: all 0.3s ease;
            ">
              Decline
            </a>
          </div>
        </div>

        <div style="${emailStyles.footer}">
          <p>Help someone grow by being their accountability partner.</p>
        </div>
      </div>
    `
  });
}

export async function sendInvitationAccepted({ userEmail, userName, partnerEmail, promise }: {
  userEmail: string;
  userName: string;
  partnerEmail: string;
  promise: string;
}) {
  return resend.emails.send({
    from: 'Promise <onboarding@resend.dev>',
    to: userEmail,
    subject: 'Your accountability partner invitation was accepted!',
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">Great news, ${userName}!</p>
        </div>

        <div style="text-align: center;">
          <p style="${emailStyles.subheading}">
            ${partnerEmail} has accepted your invitation to be your accountability partner.
          </p>

          <div style="${emailStyles.promise}">
            ${promise}
          </div>

          <p style="${emailStyles.subheading}">
            They'll receive a notification when you complete this promise. Stay motivated!
          </p>
        </div>

        <div style="${emailStyles.footer}">
          <p>You're not alone on this journey.</p>
        </div>
      </div>
    `
  });
}

export async function sendInvitationDeclined({ userEmail, userName, partnerEmail, promise }: {
  userEmail: string;
  userName: string;
  partnerEmail: string;
  promise: string;
}) {
  return resend.emails.send({
    from: 'Promise <onboarding@resend.dev>',
    to: userEmail,
    subject: 'Accountability partner invitation update',
    html: `
      <div style="${emailStyles.container}">
        <div style="${emailStyles.header}">
          <h1 style="${emailStyles.heading}">Promise</h1>
          <p style="${emailStyles.subheading}">Hello, ${userName}</p>
        </div>

        <div style="text-align: center;">
          <p style="${emailStyles.subheading}">
            ${partnerEmail} has declined your invitation to be your accountability partner.
          </p>

          <div style="${emailStyles.promise}">
            ${promise}
          </div>

          <p style="${emailStyles.subheading}">
            Don't worry - you can still achieve your promise on your own. You've got this!
          </p>
        </div>

        <div style="${emailStyles.footer}">
          <p>Your commitment to yourself is what matters most.</p>
        </div>
      </div>
    `
  });
} 