export default function TOS() {
  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-file-contract" /> Legal Documents
        </p>
        <div className="line" />

        <blockquote>
          <strong>Disclaimer:</strong> This document was not created by a
          lawyer and may not meet all legal requirements in your jurisdiction.
          It is provided for transparency regarding how ddeChat operates.
        </blockquote>

        <h1>Terms of Service</h1>

        <p>
          <strong>Effective Date:</strong> February 7, 2026
        </p>

        <h2>1. Introduction</h2>
        <p>
          ddeChat is a social platform developed and maintained by
          <strong> ddededodediamante</strong>, based in Argentina. By using ddeChat,
          you agree to these Terms of Service ("Terms"). If you do not agree,
          you must not use the platform.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          ddeChat is intended for users aged 13 and older. By creating an
          account, you confirm that you are at least 13 years of age.
        </p>

        <h2>3. Use of the Platform</h2>
        <p>
          Users may browse public content without registration. To post content,
          message others, or add friends, registration is required. You may
          register via username/password or through <strong>GitHub OAuth</strong>.
        </p>

        <h2>4. User Conduct & Anti-Abuse</h2>
        <p>By using ddeChat, you agree not to:</p>
        <ul>
          <li>Post or share spam, explicit, harmful, abusive, harassing, hateful, or misleading content.</li>
          <li>Promote or engage in violence, discrimination, self-harm, suicide, or illegal activity.</li>
          <li>Impersonate others, misuse the platform, or harm the reputation of ddeChat or its users.</li>
          <li>Engage in illegal, malicious, or disruptive behavior, including malware distribution or phishing.</li>
          <li>Attempt to bypass security, access restricted areas, or gain unauthorized access to accounts or data.</li>
          <li>Use bots, automated scripts, or multiple accounts to manipulate the platform or evade enforcement.</li>
          <li>Violate intellectual property rights or the rights, privacy, or data of other users.</li>
          <li>Use the platform for unauthorized commercial purposes.</li>
          <li>Engage in any activity that violates applicable laws, regulations, or platform integrity.</li>
        </ul>

        <p>
          <strong>Ban Policy:</strong> Staff members may suspend or ban accounts
          that violate these rules. ddeChat employs <strong>IP-based blocking</strong>.
          If an account is banned, all associated IP addresses used by that
          account will be blacklisted to prevent ban evasion.
        </p>

        <h2>5. Account Responsibility</h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          password/token and for all activities that occur under your account.
        </p>

        <h2>6. Content Ownership</h2>
        <p>
          You retain ownership of the content you post. However, you grant
          ddeChat a non-exclusive license to display and distribute your content
          within the platform.
        </p>

        <h2>7. Platform Availability</h2>
        <p>
          ddeChat is provided "as is" with no warranties regarding uptime.
          The developer is not liable for any losses arising from your use of
          the platform or the loss of access due to an IP or account ban.
        </p>

        <h2>8. Changes to These Terms</h2>
        <p>
          Continued use of ddeChat after changes constitutes acceptance of the
          updated Terms.
        </p>

        <h2>9. Governing Law</h2>
        <p>These Terms are governed by the laws of Argentina.</p>

        <h2>10. Contact</h2>
        <p>
          Contact: <strong>heliumboat@gmail.com</strong>
        </p>

        <div className="line" />

        <h1>Privacy Policy</h1>

        <p>
          <strong>Effective Date:</strong> February 7, 2026
        </p>

        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy outlines how ddeChat handles user data. By using
          ddeChat, you consent to the practices described here.
        </p>

        <h2>2. Information Collected</h2>
        <p>ddeChat stores the following information:</p>
        <ul>
          <li><strong>Username & ID</strong> - To identify your account.</li>
          <li><strong>Password</strong> - Stored securely using salt/hashing.</li>
          <li>
            <strong>Network Identifiers (IP Addresses)</strong> - We log every
            IP address used to access your account. This is used strictly for
            security, rate limiting, and enforcing bans.
          </li>
          <li>
            <strong>GitHub Data</strong> - If you use GitHub login, we store your
            GitHub ID and username.
          </li>
          <li><strong>Posts, Comments, & Messages</strong> - All content you create.</li>
          <li><strong>Interaction Data</strong> - Friends, likes, and alerts.</li>
        </ul>

        <h2>3. How Information Is Used</h2>
        <ul>
          <li>To manage user sessions via hashed tokens.</li>
          <li>To display your profile and content to other users.</li>
          <li>
            <strong>Security:</strong> To detect multi-account abuse and
            permanently block banned users via their IP history.
          </li>
        </ul>
        <p><strong>No data is sold or shared with third-party advertisers.</strong></p>

        <h2>4. Data Storage and Security</h2>
        <p>
          All data is stored in a MongoDB database. We take reasonable steps
          to secure your information, including the use of modern hashing
          algorithms for passwords and tokens.
        </p>

        <h2>5. Data Retention & Deletion</h2>
        <p>
          User content and IP logs are stored as long as the account is active.
          Banned IP addresses are stored indefinitely in a blacklist to maintain
          platform safety. You may request account deletion by emailing us.
        </p>

        <h2>6. Children's Privacy</h2>
        <p>
          ddeChat does not knowingly collect data from individuals under 13.
        </p>

        <h2>7. Contact</h2>
        <p>
          For privacy concerns, contact: <strong>heliumboat@gmail.com</strong>
        </p>
      </div>
    </>
  );
}
