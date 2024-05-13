import React from "react";

const CopyrightFooter = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <a
          href="//www.dmca.com/Protection/Status.aspx?ID=6767bae0-c896-4ff2-a72d-8113cbf99c17"
          title="DMCA.com Protection Status"
          className="dmca-badge"
        >
          <img
            src="https://images.dmca.com/Badges/dmca_protected_sml_120g.png?ID=6767bae0-c896-4ff2-a72d-8113cbf99c17"
            alt="DMCA.com Protection Status"
          />
        </a>
        <p id="copyRightText">
          © {new Date().getFullYear()} Spend Sense. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default CopyrightFooter;
