import "./UserUsageModal.css";

export default function UserUsageModal({
  open,
  title,
  users,
  onClose,
  activeColumn,
}) {
  if (!open) return null;

  const isActive = (column) =>
    activeColumn === column ? "active-column" : "";

  return (
    <div className="modal-overlay">
      <div className="usage-modal">

        <div className="modal-header">
          <h2>{title}</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✖
          </button>
        </div>

        <div className="table-container">
          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Provider</th>
                <th>Model</th>
                <th className={isActive("latency")}>
                  Latency (ms)
                </th>

                <th className={isActive("input")}>
                  Input
                </th>

                <th className={isActive("output")}>
                  Output
                </th>

                <th className={isActive("billable")}>
                  Total Token
                </th>

                <th className={isActive("cost")}>
                  Cost (₹)
                </th>

                <th className={isActive("success")}>
                  Status
                </th>

                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    style={{
                      textAlign: "center",
                      padding: "25px",
                    }}
                  >
                    No Records Found
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={index}>

                    <td>{index + 1}</td>

                    <td>{user.name || "-"}</td>

                    <td>{user.email || "-"}</td>

                    <td>{user.provider}</td>

                    <td>{user.model}</td>

                    <td className={isActive("latency")}>
                      {user.latency_ms} ms
                    </td>

                    <td className={isActive("input")}>
                      {user.input_tokens}
                    </td>

                    <td className={isActive("output")}>
                      {user.output_tokens}
                    </td>

                    <td className={isActive("billable")}>
                      {user.billable_tokens}
                    </td>

                    <td className={isActive("cost")}>
                      ₹{Number(user.estimated_cost).toFixed(6)}
                    </td>

                    <td className={isActive("success")}>
                      <span
                        className={
                          user.status === "SUCCESS"
                            ? "status-success"
                            : "status-failed"
                        }
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        user.created_at
                      ).toLocaleString()}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}