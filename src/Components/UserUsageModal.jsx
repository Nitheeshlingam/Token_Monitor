import "./UserUsageModal.css";

export default function UserUsageModal({
  open,
  title,
  users,
  onClose,
}) {
  if (!open) return null;

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
                <th>Image</th>
                <th>Input</th>
                <th>Output</th>
                <th>Billable</th>
                <th>Cost (₹)</th>
                <th>Status</th>
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

                    <td>{user.image_name}</td>

                    <td>{user.input_tokens}</td>

                    <td>{user.output_tokens}</td>

                    <td>{user.billable_tokens}</td>

                    <td>
                      ₹
                      {Number(
                        user.estimated_cost
                      ).toFixed(6)}
                    </td>

                    <td>
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