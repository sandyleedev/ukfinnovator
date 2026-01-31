import { COLORS } from "@/app/constants";

export const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: "white",
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      padding: "24px",
    }}
  >
    <h4
      style={{
        fontSize: "16px",
        fontWeight: "600",
        marginBottom: "16px",
        color: COLORS.dark,
      }}
    >
      {title}
    </h4>
    {children}
  </div>
);

export default ChartCard;
