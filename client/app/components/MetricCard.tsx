export const MetricCard = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <div
    style={{
      background: "white",
      border: `2px solid ${color}`,
      borderRadius: "12px",
      padding: "20px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      <div style={{ color: color }}>{icon}</div>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#6b7280",
        }}
      >
        {label}
      </div>
    </div>
    <div
      style={{
        fontSize: "28px",
        fontWeight: "700",
        color: color,
      }}
    >
      {value}
    </div>
  </div>
);

export default MetricCard;
