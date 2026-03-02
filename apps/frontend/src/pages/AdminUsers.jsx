import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchUsersAdmin, updateUserAdmin, createUserAdmin, deleteUserAdmin } from "../services/admin";

const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "user" });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [createError, setCreateError] = useState("");
  const [updatingKind, setUpdatingKind] = useState(null); // "approve" | "reject" | "role"
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(10);
  const [allPage, setAllPage] = useState(1);
  const [allPageSize, setAllPageSize] = useState(20);

  useEffect(() => {
    setStatus("loading");
    fetchUsersAdmin()
      .then((data) => {
        setUsers(Array.isArray(data?.users) ? data.users : []);
        setStatus("ready");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error.message || "Could not load users.");
      });
  }, []);

  const pendingUsers = useMemo(
    () => users.filter((u) => u.status === "pending"),
    [users]
  );
  const nonPendingUsers = useMemo(
    () => users.filter((u) => u.status !== "pending"),
    [users]
  );

  const pendingTotalPages = Math.max(1, Math.ceil((pendingUsers.length || 1) / pendingPageSize));
  const allTotalPages = Math.max(1, Math.ceil((nonPendingUsers.length || 1) / allPageSize));

  const pendingPageItems = useMemo(() => {
    const start = (pendingPage - 1) * pendingPageSize;
    return pendingUsers.slice(start, start + pendingPageSize);
  }, [pendingUsers, pendingPage, pendingPageSize]);

  const allPageItems = useMemo(() => {
    const start = (allPage - 1) * allPageSize;
    return nonPendingUsers.slice(start, start + allPageSize);
  }, [nonPendingUsers, allPage, allPageSize]);

  const pendingStartIndex = pendingUsers.length === 0 ? 0 : (pendingPage - 1) * pendingPageSize + 1;
  const pendingEndIndex =
    pendingUsers.length === 0 ? 0 : Math.min(pendingPage * pendingPageSize, pendingUsers.length);
  const allStartIndex = nonPendingUsers.length === 0 ? 0 : (allPage - 1) * allPageSize + 1;
  const allEndIndex =
    nonPendingUsers.length === 0
      ? 0
      : Math.min(allPage * allPageSize, nonPendingUsers.length);

  useEffect(() => {
    const maxPendingPage = Math.max(1, Math.ceil((pendingUsers.length || 1) / pendingPageSize));
    if (pendingPage > maxPendingPage) {
      setPendingPage(maxPendingPage);
    }
  }, [pendingUsers.length, pendingPage, pendingPageSize]);

  useEffect(() => {
    const maxAllPage = Math.max(1, Math.ceil((nonPendingUsers.length || 1) / allPageSize));
    if (allPage > maxAllPage) {
      setAllPage(maxAllPage);
    }
  }, [nonPendingUsers.length, allPage, allPageSize]);

  const handleApprove = async (user) => {
    setUpdatingUserId(user.id);
    setUpdatingKind("approve");
    try {
      const updated = await updateUserAdmin(user.id, { status: "approved" });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Could not approve user.");
    } finally {
      setUpdatingUserId(null);
      setUpdatingKind(null);
    }
  };

  const handleReject = async (user) => {
    setUpdatingUserId(user.id);
    setUpdatingKind("reject");
    try {
      const updated = await updateUserAdmin(user.id, { status: "rejected" });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Could not reject user.");
    } finally {
      setUpdatingUserId(null);
      setUpdatingKind(null);
    }
  };

  const handleToggleAdmin = async (user) => {
    const nextRole = user.role === "admin" ? "user" : "admin";
    setUpdatingUserId(user.id);
    setUpdatingKind("role");
    try {
      const updated = await updateUserAdmin(user.id, { role: nextRole });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Could not change role.");
    } finally {
      setUpdatingUserId(null);
      setUpdatingKind(null);
    }
  };

  const handleDelete = (user) => {
    setDeleteTarget(user);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setStatus("saving");
    setMessage("");
    try {
      await deleteUserAdmin(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Could not delete user.");
      setDeleteTarget(null);
    }
  };

  const handleNewUserChange = (event) => {
    const { name, value } = event.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    setCreateError("");
    try {
      const created = await createUserAdmin({
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      });
      setUsers((prev) => [...prev, created]);
      setNewUser({ email: "", password: "", role: "user" });
      setStatus("ready");
      setCreateModalOpen(false);
    } catch (error) {
      setStatus("ready");
      setCreateError(error.message || "Could not create user.");
    }
  };

  return (
    <main className="admin-users-page">
      <section className="container">
        <header className="page-header">
          <Link to="/home" className="page-header-back" aria-label={t("nav.home")} title={t("nav.home")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <h1 className="page-header-title">{t("admin.title", "User administration")}</h1>
          <div className="page-header-actions">
            <button
              type="button"
              className="page-header-action-round primary"
              onClick={() => {
                setCreateError("");
                setCreateModalOpen(true);
              }}
              aria-label={t("admin.createTitle", "Create user")}
              title={t("admin.createTitle", "Create user")}
            >
              <span className="page-header-action-round-icon" aria-hidden>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </span>
            </button>
          </div>
        </header>

        {message && (
          <div className={`message ${status === "error" ? "error" : "success"}`} role="status">
            {message}
          </div>
        )}

        <div className="admin-grid">
          <div className="admin-column">
            <h2>{t("admin.pendingTitle", "Pending approvals")}</h2>
            {status === "loading" && <p>{t("labels.loading", "Loading...")}</p>}
            {pendingUsers.length === 0 && status === "ready" && (
              <p className="muted">{t("admin.noPending", "No pending signups right now.")}</p>
            )}
            {pendingUsers.length > 0 && (
              <div className="admin-table-wrap" role="region" aria-label={t("admin.pendingTitle", "Pending approvals")}>
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>{t("profile.form.email")}</th>
                      <th>{t("admin.statusLabel", "Status")}</th>
                      <th>{t("admin.actionsLabel", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPageItems.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>
                          <span className="admin-status-badge admin-status-badge-pending">
                            {t("admin.status.pending", "Pending")}
                          </span>
                        </td>
                        <td>
                          <div className="admin-user-actions">
                            <button
                              type="button"
                              className="btn small primary"
                              onClick={() => handleApprove(user)}
                              disabled={updatingUserId === user.id}
                              aria-busy={updatingUserId === user.id}
                            >
                              {updatingUserId === user.id && updatingKind === "approve" && (
                                <span className="btn-spinner" aria-hidden />
                              )}
                              {t("admin.actions.approve", "Approve")}
                            </button>
                            <button
                              type="button"
                              className="btn small ghost"
                              onClick={() => handleReject(user)}
                              disabled={updatingUserId === user.id}
                              aria-busy={updatingUserId === user.id}
                            >
                              {updatingUserId === user.id && updatingKind === "reject" && (
                                <span className="btn-spinner" aria-hidden />
                              )}
                              {t("admin.actions.reject", "Reject")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin-table-footer">
                  <div className="admin-table-rows">
                    <label>
                      {t("admin.rowsPerPage", "Rows per page")}
                      <select
                        value={pendingPageSize}
                        onChange={(e) => {
                          setPendingPageSize(Number(e.target.value) || 10);
                          setPendingPage(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </label>
                  </div>
                  <div className="admin-table-pagination">
                    <span>
                      {pendingStartIndex}-{pendingEndIndex}{" "}
                      {t("admin.ofCount", "of {{count}}", { count: pendingUsers.length })}
                    </span>
                    <div className="admin-table-pagination-buttons">
                      <button
                        type="button"
                        className="btn small ghost admin-page-btn"
                        onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                        disabled={pendingPage <= 1}
                      >
                        {t("admin.prevPage", "Prev")}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost admin-page-btn"
                        onClick={() =>
                          setPendingPage((p) =>
                            p >= pendingTotalPages ? pendingTotalPages : p + 1
                          )
                        }
                        disabled={pendingPage >= pendingTotalPages || pendingUsers.length === 0}
                      >
                        {t("admin.nextPage", "Next")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="admin-column">
            <h2>{t("admin.allUsersTitle", "All users")}</h2>
            {nonPendingUsers.length > 0 && (
              <div className="admin-table-wrap" role="region" aria-label={t("admin.allUsersTitle", "All users")}>
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>{t("profile.form.email")}</th>
                      <th>{t("admin.roleLabel", "Role")}</th>
                      <th>{t("admin.statusLabel", "Status")}</th>
                      <th>{t("admin.testUser", "Test user")}</th>
                      <th>{t("admin.actionsLabel", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPageItems.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{t(`admin.role.${user.role}`, user.role)}</td>
                        <td>
                          <span
                            className={`admin-status-badge admin-status-badge-${user.status || "unknown"}`}
                          >
                            {t(`admin.status.${user.status}`, user.status)}
                          </span>
                        </td>
                        <td>{user.isTestUser ? t("admin.testUser", "Test user") : "—"}</td>
                        <td>
                          <div className="admin-user-actions">
                            <button
                              type="button"
                              className="btn small ghost admin-btn-with-spinner"
                              onClick={() => handleToggleAdmin(user)}
                              disabled={updatingUserId === user.id}
                              aria-busy={updatingUserId === user.id}
                            >
                              {updatingUserId === user.id && updatingKind === "role" && (
                                <span className="btn-spinner" aria-hidden />
                              )}
                              {user.role === "admin"
                                ? t("admin.actions.demote", "Remove admin")
                                : t("admin.actions.promote", "Make admin")}
                            </button>
                            <button
                              type="button"
                              className="btn small danger"
                              onClick={() => handleDelete(user)}
                              disabled={user.isTestUser}
                            >
                              {t("admin.actions.delete", "Delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin-table-footer">
                  <div className="admin-table-rows">
                    <label>
                      {t("admin.rowsPerPage", "Rows per page")}
                      <select
                        value={allPageSize}
                        onChange={(e) => {
                          setAllPageSize(Number(e.target.value) || 20);
                          setAllPage(1);
                        }}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </label>
                  </div>
                  <div className="admin-table-pagination">
                    <span>
                      {allStartIndex}-{allEndIndex}{" "}
                      {t("admin.ofCount", "of {{count}}", { count: nonPendingUsers.length })}
                    </span>
                    <div className="admin-table-pagination-buttons">
                      <button
                        type="button"
                        className="btn small ghost admin-page-btn"
                        onClick={() => setAllPage((p) => Math.max(1, p - 1))}
                        disabled={allPage <= 1}
                      >
                        {t("admin.prevPage", "Prev")}
                      </button>
                      <button
                        type="button"
                        className="btn small ghost admin-page-btn"
                        onClick={() =>
                          setAllPage((p) => (p >= allTotalPages ? allTotalPages : p + 1))
                        }
                        disabled={allPage >= allTotalPages || nonPendingUsers.length === 0}
                      >
                        {t("admin.nextPage", "Next")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      {createModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-create-title"
        >
          <div className="modal-card">
            <h2 id="admin-create-title">
              {t("admin.createTitle", "Create user")}
            </h2>
            <form className="admin-create-form" onSubmit={handleCreateUser}>
              <div className="field">
                <label htmlFor="admin-new-email">{t("profile.form.email")}</label>
                <input
                  id="admin-new-email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="admin-new-password">{t("auth.register.passwordLabel")}</label>
                <input
                  id="admin-new-password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="admin-new-role">{t("admin.roleLabel", "Role")}</label>
                <select
                  id="admin-new-role"
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                >
                  <option value="user">{t("admin.role.user", "User")}</option>
                  <option value="admin">{t("admin.role.admin", "Admin")}</option>
                </select>
              </div>
              {createError && (
                <p className="message error" role="alert">
                  {createError}
                </p>
              )}
              <div className="modal-actions">
                <button
                  type="submit"
                  className="btn primary"
                  disabled={status === "saving"}
                  aria-busy={status === "saving"}
                >
                  {status === "saving"
                    ? t("admin.actions.creating", "Creating…")
                    : t("admin.actions.createUser", "Create user")}
                </button>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setCreateError("");
                  }}
                  disabled={status === "saving"}
                >
                  {t("trips.cancel", "Cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-delete-title"
        >
          <div className="modal-card">
            <h2 id="admin-delete-title">
              {t("admin.deleteTitle", "Delete user?")}
            </h2>
            <p>
              {t(
                "admin.deleteConfirm",
                "Delete this user and their trips? This cannot be undone."
              )}{" "}
              <strong>{deleteTarget.email}</strong>
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn danger"
                onClick={handleConfirmDelete}
                disabled={status === "saving"}
              >
                {status === "saving"
                  ? t("admin.actions.deleting", "Deleting…")
                  : t("admin.actions.delete", "Delete")}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setDeleteTarget(null)}
                disabled={status === "saving"}
              >
                {t("trips.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminUsers;

