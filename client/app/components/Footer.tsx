import { COLORS } from "@/app/constants";

export const Footer = () => {
  return (
    <div
      style={{
        marginTop: "32px",
        padding: "16px",
        background: "#f9fafb",
        borderRadius: "8px",
        textAlign: "center",
        fontSize: "12px",
        color: "#6b7280",
      }}
    >
      <strong>UKFinnovator 2026 Challenge</strong> | FinTech for EdTech |
      Sponsor:{" "}
      <a
        href="http://mysmartteach.com/"
        style={{
          color: COLORS.primary,
          textDecoration: "none",
          fontWeight: "600",
        }}
      >
        My Smart Teach
      </a>
    </div>
  );
};

export default Footer;
