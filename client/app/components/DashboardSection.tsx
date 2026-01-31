import { COLORS } from "@/app/constants";

export const DashboardSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: "28px" }}>
    <h3
      style={{
        fontSize: "16px",
        fontWeight: "700",
        marginBottom: "16px",
        color: COLORS.dark,
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: "8px",
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

export default DashboardSection;
