import React, { useEffect, useState } from "react";
import notificationService from "../../services/api/notificationService";
import { FaBell, FaTrash, FaCheck } from "react-icons/fa";
import { useAuth } from "../../contexts/authContext";

const Notification = () => {
	const { currentUser } = useAuth();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);

	const fetchNotifications = async (nextPage = 1, append = false) => {
		if (!currentUser || !currentUser._id) return;
		if (nextPage > totalPages && append) return;
		if (append) setLoadingMore(true); else setLoading(true);
		try {
			const res = await notificationService.getList({ userId: currentUser._id, page: nextPage });
			if (append) {
				setNotifications(prev => [...prev, ...(res.data.notifications || [])]);
			} else {
				setNotifications(res.data.notifications || []);
			}
			setUnreadCount(res.data.unreadCount || 0);
			setTotalPages(res.data.totalPages || 1);
			setPage(nextPage);
		} catch (err) {
			// handle error
		}
		if (append) setLoadingMore(false); else setLoading(false);
	};

	useEffect(() => {
		fetchNotifications(1, false);
		const interval = setInterval(() => fetchNotifications(1, false), 60000);
		return () => clearInterval(interval);
	}, [currentUser]);

	const handleMarkAllRead = async () => {
		await notificationService.markAllRead();
		fetchNotifications(1, false);
	};

	const handleMarkRead = async (id) => {
		await notificationService.markRead(id);
		fetchNotifications(1, false);
	};

	const handleDelete = async (id) => {
		await notificationService.delete(id);
		fetchNotifications(1, false);
	};

	const handleDeleteRead = async () => {
		await notificationService.deleteRead();
		fetchNotifications(1, false);
	};

	const handleScroll = (e) => {
		const { scrollTop, scrollHeight, clientHeight } = e.target;
		if (scrollTop + clientHeight >= scrollHeight - 10 && !loadingMore && page < totalPages) {
			fetchNotifications(page + 1, true);
		}
	};

	return (
		<div style={{ position: "relative", display: "inline-block" }}>
			<div style={{ position: "relative", display: "inline-block" }}>
				<FaBell
					size={24}
					style={{ cursor: "pointer" }}
					onClick={() => setOpen((o) => !o)}
				/>
				{unreadCount > 0 && (
					<span
						style={{
							position: "absolute",
							top: -6,
							right: -6,
							background: "red",
							color: "white",
							borderRadius: "50%",
							padding: "2px 6px",
							fontSize: "12px",
							minWidth: 20,
							textAlign: "center",
						}}
					>
						{unreadCount}
					</span>
				)}
			</div>
			{open && (
				<div
					style={{
						position: "absolute",
						right: 0,
						top: "120%",
						width: 350,
						background: "#fff",
						boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
						borderRadius: 8,
						zIndex: 1200,
						padding: 16,
					}}
				>
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
						<span style={{ fontWeight: "bold" }}>Thông báo</span>
						<div>
							<button onClick={handleMarkAllRead} title="Đánh dấu tất cả đã đọc" style={{ marginRight: 8 }}>
								<FaCheck />
							</button>
							<button onClick={handleDeleteRead} title="Xóa đã đọc">
								<FaTrash />
							</button>
						</div>
					</div>
					<hr />
					{loading ? (
						<div>Đang tải...</div>
					) : notifications.length === 0 ? (
						<div>Không có thông báo.</div>
					) : (
						<ul
							style={{ listStyle: "none", padding: 0, maxHeight: 300, overflowY: "auto" }}
							onScroll={handleScroll}
						>
							{notifications.map((n) => (
								<li
									key={n._id}
									style={{
										background: n.isRead ? "#f7f7f7" : "#e6f7ff",
										marginBottom: 8,
										padding: 8,
										borderRadius: 6,
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div>
										<div style={{ fontWeight: n.isRead ? "normal" : "bold", color: "#222" }}>{n.title}</div>
										<div style={{ fontSize: 13, color: "#222" }}>{n.message}</div>
										<div style={{ fontSize: 11, color: "#888" }}>{new Date(n.createdAt).toLocaleString()}</div>
									</div>
									<div style={{ display: "flex", gap: 8 }}>
										{!n.isRead && (
											<button onClick={() => handleMarkRead(n._id)} title="Đánh dấu đã đọc">
												<FaCheck color="#222" />
											</button>
										)}
										<button onClick={() => handleDelete(n._id)} title="Xóa">
											<FaTrash color="#222" />
										</button>
									</div>
								</li>
							))}
							{loadingMore && <div>Đang tải thêm...</div>}
						</ul>
					)}
				</div>
			)}
		</div>
	);
};

export default Notification;