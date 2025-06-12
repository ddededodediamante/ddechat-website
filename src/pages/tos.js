export default function TOS() {
  return (
    <>
      <div className="panel-content">
        <blockquote>
          <strong>Disclaimer:</strong> This document was not created by a
          lawyer. It is provided as a general-purpose template and may not meet
          all legal requirements in your jurisdiction.
        </blockquote>

        <h1>Terms of Service</h1>

        <p>
          <strong>Effective Date:</strong> June 11, 2025
        </p>

        <h2>1. Introduction</h2>
        <p>
          ddeChat is a social platform developed and maintained by an
          individual, known online as <strong>ddededodediamante</strong>, and
          based in Argentina. By using ddeChat, you agree to these Terms of
          Service ("Terms"). If you do not agree, you must not use the platform.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          ddeChat is intended for users aged 13 and older. By creating an
          account, you confirm that you are at least 13 years of age.
        </p>

        <h2>3. Use of the Platform</h2>
        <p>
          Users may browse public content without registration. To post content,
          message others, or add friends, registration is required. You must
          provide a username and password. Avatars are optional.
        </p>

        <h2>4. User Conduct</h2>
        <p>By using ddeChat, you agree not to:</p>
        <ul>
          <li>Post or share spam, harmful, harassing, or explicit content.</li>
          <li>Engage in illegal or malicious behavior.</li>
          <li>Impersonate others or misuse the platform in any way.</li>
        </ul>
        <p>
          Staff members may remove content and suspend or ban accounts that
          violate these rules.
        </p>

        <h2>5. Account Responsibility</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          password and for all activities that occur under your account.
        </p>

        <h2>6. Content Ownership</h2>
        <p>
          You retain ownership of the content you post. However, you grant
          ddeChat a non-exclusive license to display and distribute your content
          within the platform.
        </p>

        <h2>7. Platform Availability</h2>
        <p>
          ddeChat is provided "as is" with no warranties regarding uptime,
          accuracy, or reliability. The developer is not liable for any losses
          or damages arising from your use of the platform.
        </p>

        <h2>8. Changes to These Terms</h2>
        <p>
          These Terms may be updated from time to time. Updates will be
          reflected by the "Effective Date" shown above. Continued use of
          ddeChat after changes constitutes acceptance of the updated Terms.
        </p>

        <h2>9. Governing Law</h2>
        <p>These Terms are governed by the laws of Argentina.</p>

        <h2>10. Contact</h2>
        <p>
          For questions regarding these Terms, please contact:{" "}
          <strong>heliumboat@gmail.com</strong>
        </p>

        <h1>Privacy Policy</h1>

        <p>
          <strong>Effective Date:</strong> June 11, 2025
        </p>

        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy outlines how ddeChat handles user data. By using
          ddeChat, you consent to the practices described here.
        </p>

        <h2>2. Information Collected</h2>
        <p>ddeChat stores the following information about its users:</p>
        <ul>
          <li>
            <strong>Username</strong> - Required for account creation and
            identification.
          </li>
          <li>
            <strong>Account ID</strong> - A unique generated ID for each user.
          </li>
          <li>
            <strong>Password</strong> - Stored securely using hashing (not in
            plain text).
          </li>
          <li>
            <strong>Authentication Tokens</strong> - Stored as hashed values
            with an expiration timestamp. Multiple tokens may exist for a single
            account to support multi-session use.
          </li>
          <li>
            <strong>Avatar</strong> - Optional image URL or identifier.
          </li>
          <li>
            <strong>Posts and Comments</strong> - Including content, author ID,
            replies, timestamps, and likes (current and all-time).
          </li>
          <li>
            <strong>Direct Messages</strong> - Stored per user, including
            content, timestamp, author ID, and spoiler status.
          </li>
          <li>
            <strong>Alerts</strong> - Notifications for events on the platform,
            with read/unread status and related metadata.
          </li>
          <li>
            <strong>Friends</strong> - Includes friend lists, friend requests
            (incoming and outgoing), and timestamps of friend additions.
          </li>
          <li>
            <strong>Moderator Status</strong> - Indicates whether a user has
            moderation privileges.
          </li>
        </ul>

        <h2>3. How Information Is Used</h2>
        <p>Your data is used for the following purposes:</p>
        <ul>
          <li>
            To authenticate and manage user sessions securely using hashed
            tokens.
          </li>
          <li>
            To display posts, messages, and profiles associated with your
            account.
          </li>
          <li>
            To facilitate direct messaging, friend connections, and
            notifications.
          </li>
          <li>
            To identify moderation status (if applicable) and grant appropriate
            permissions.
          </li>
        </ul>
        <p>
          No data is sold or monetized. Data is only used internally for
          platform functionality.
        </p>

        <h2>4. Data Storage and Security</h2>
        <p>
          All user data is stored in a MongoDB database hosted on Render.com.
          Passwords and tokens are hashed and not accessible in plain text.
          Reasonable steps are taken to secure the database and prevent
          unauthorized access, including limiting external exposure and using
          hashed authentication credentials.
        </p>
        <p>
          While no system is completely immune to breaches, ddeChat applies
          modern security practices within the scope of its development and
          hosting tools.
        </p>

        <h2>5. Data Sharing</h2>
        <p>
          No user data is sold or shared with third parties. Hosting and
          database services are used solely for operating the platform.
        </p>

        <h2>6. Your Rights and Choices</h2>
        <ul>
          <li>You may change your avatar at any time.</li>
          <li>
            You may request account deletion by contacting the administrator at{" "}
            <strong>heliumboat@gmail.com</strong>.
          </li>
        </ul>

        <h2>7. Children's Privacy</h2>
        <p>
          ddeChat is not intended for users under the age of 13. No data is
          knowingly collected from individuals under this age.
        </p>

        <h2>8. Policy Updates</h2>
        <p>
          This policy may be updated periodically. Changes will be reflected by
          the "Effective Date" at the top of this page. Continued use of the
          platform implies acceptance of any updates.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions regarding this Privacy Policy, contact:{" "}
          <strong>heliumboat@gmail.com</strong>
        </p>
      </div>
    </>
  );
}
