import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ShareButton from "../components/ShareButton";

const CATEGORY_ICONS = {
  Electronics: "📱",
  Documents: "📄",
  Accessories: "💍",
  Clothing: "👕",
  Books: "📚",
  Sports: "⚽",
  Keys: "🔑",
  Wallet: "👛",
  Other: "📦",
};

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [claimText, setClaimText] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        setItem(res.data);
        // Matches fetch karo
        if (user) {
          const matchRes = await api.get(`/items/${id}/matches`);
          setMatches(matchRes.data);
        }
      } catch {
        navigate("/");
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const handleClaim = async () => {
    if (!claimText.trim()) return;
    setClaimLoading(true);
    try {
      await api.post(`/claims/${id}`, { description: claimText });
      setClaimSuccess(true);
      setClaimText("");
    } catch (err) {
      alert(err.response?.data?.message || "Error aaya");
    }
    setClaimLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Item delete karna chahte ho?")) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/items/${id}`);
      navigate("/");
    } catch {
      alert("Delete nahi hua");
    }
    setDeleteLoading(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid #e2e8f0",
            borderTop: "3px solid #0d9488",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (!item) return null;

  const isOwner = user?._id === item.user?._id;
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Back Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <Link
            to="/"
            style={{
              color: "#64748b",
              fontFamily: "DM Sans, sans-serif",
              fontSize: "14px",
            }}
            className="flex items-center gap-2 hover:text-teal-600 transition-colors"
          >
            ← Back to listings
          </Link>
          {item && <ShareButton item={item} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT — Images */}
          <div>
            <div
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                background: "#f1f5f9",
                height: "380px",
              }}
              className="flex items-center justify-center mb-3"
            >
              {item.images?.length > 0 ? (
                <img
                  src={`${item.images[activeImg]}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl">
                  {CATEGORY_ICONS[item.category] || "📦"}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {item.images?.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {item.images.map((img, i) => (
                  <img
                    key={i}
                    src={`${img}`}
                    alt=""
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: "70px",
                      height: "70px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border:
                        activeImg === i
                          ? "2px solid #0d9488"
                          : "2px solid #e2e8f0",
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Details */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                style={{
                  background: item.type === "lost" ? "#fef2f2" : "#f0fdfb",
                  color: item.type === "lost" ? "#ef4444" : "#0d9488",
                  border: `1px solid ${item.type === "lost" ? "#fecaca" : "#99f6e4"}`,
                  borderRadius: "8px",
                  padding: "4px 14px",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: "Syne, sans-serif",
                }}
              >
                {item.type === "lost" ? "❌ Lost" : "✅ Found"}
              </span>
              <span
                style={{
                  background: "#f0fdfb",
                  color: "#0d9488",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {CATEGORY_ICONS[item.category]} {item.category}
              </span>
              <span
                style={{
                  background: item.status === "active" ? "#f0fdf4" : "#fef9c3",
                  color: item.status === "active" ? "#16a34a" : "#ca8a04",
                  borderRadius: "8px",
                  padding: "4px 12px",
                  fontSize: "13px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {item.status === "active"
                  ? "🟢 Active"
                  : item.status === "claimed"
                    ? "🟡 Claimed"
                    : "⚫ Closed"}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "Syne, sans-serif",
                color: "#0a0f1e",
                fontSize: "2rem",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
              className="mb-4"
            >
              {item.title}
            </h1>

            {/* Description */}
            <p
              style={{
                color: "#475569",
                fontFamily: "DM Sans, sans-serif",
                lineHeight: 1.7,
              }}
              className="mb-6"
            >
              {item.description}
            </p>

            {/* Info Grid */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
              }}
              className="p-5 mb-6 grid grid-cols-2 gap-4"
            >
              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  className="uppercase tracking-wider mb-1"
                >
                  📍 Location
                </p>
                <p
                  style={{
                    color: "#1e293b",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {item.location}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  className="uppercase tracking-wider mb-1"
                >
                  📅 Date
                </p>
                <p
                  style={{
                    color: "#1e293b",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {new Date(item.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  className="uppercase tracking-wider mb-1"
                >
                  👤 Reported By
                </p>
                <p
                  style={{
                    color: "#1e293b",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {item.user?.name}
                </p>
              </div>
              <div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontFamily: "DM Sans, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                  className="uppercase tracking-wider mb-1"
                >
                  📧 Contact
                </p>
                <p
                  style={{
                    color: "#0d9488",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                  }}
                >
                  {item.user?.email}
                </p>
              </div>
            </div>

            {/* Claim Section */}
            {user && !isOwner && item.status === "active" && (
              <div
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                }}
                className="p-5 mb-4"
              >
                {claimSuccess ? (
                  <div
                    style={{
                      background: "#f0fdfb",
                      border: "1px solid #99f6e4",
                      borderRadius: "12px",
                      color: "#0d9488",
                      padding: "16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
                      🎉
                    </div>
                    <p
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontWeight: 700,
                        fontSize: "15px",
                      }}
                    >
                      Claim Submit Ho Gaya!
                    </p>
                    <p
                      style={{
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: "13px",
                        color: "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      Owner se chat karke verify karo
                    </p>
                  </div>
                ) : (
                  <>
                    <h3
                      style={{
                        fontFamily: "Syne, sans-serif",
                        color: "#1e293b",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      🙋 Yeh Mera Item Hai!
                    </h3>
                    <p
                      style={{
                        color: "#64748b",
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: "13px",
                        marginBottom: "12px",
                      }}
                    >
                      Agar yeh item tumhara hai to claim karo aur proof do
                    </p>
                    <textarea
                      style={{
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        fontFamily: "DM Sans, sans-serif",
                        width: "100%",
                        padding: "12px",
                        resize: "none",
                      }}
                      className="focus:outline-none text-gray-700"
                      onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                      placeholder="Proof do — kab khoya, kya features hain, koi unique mark hai..."
                      rows={3}
                      value={claimText}
                      onChange={(e) => setClaimText(e.target.value)}
                    />
                    <button
                      onClick={handleClaim}
                      disabled={claimLoading || !claimText.trim()}
                      style={{
                        background: "linear-gradient(135deg, #0d9488, #0f766e)",
                        fontFamily: "Syne, sans-serif",
                        borderRadius: "12px",
                        boxShadow: "0 4px 15px rgba(13,148,136,0.3)",
                        width: "100%",
                        color: "white",
                        padding: "13px",
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        marginTop: "10px",
                        opacity: claimLoading || !claimText.trim() ? 0.5 : 1,
                      }}
                    >
                      {claimLoading ? "⏳ Submitting..." : "🚀 Claim This Item"}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Chat Button */}
            {user && !isOwner && (
              <Link
                to={`/chat/${item.user?._id}`}
                style={{
                  background: "#0a0f1e",
                  fontFamily: "Syne, sans-serif",
                  borderRadius: "12px",
                  display: "block",
                  textAlign: "center",
                }}
                className="text-white py-3 font-bold hover:opacity-80 transition mb-4"
              >
                💬 Chat with Owner
              </Link>
            )}

            {/* Owner Actions */}
            {(isOwner || isAdmin) && (
              <div className="flex gap-3">
                <Link
                  to={`/edit/${item._id}`}
                  style={{
                    flex: 1,
                    background: "#f0fdfb",
                    border: "2px solid #99f6e4",
                    color: "#0d9488",
                    borderRadius: "12px",
                    fontFamily: "Syne, sans-serif",
                    textAlign: "center",
                    padding: "12px",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                  className="hover:bg-teal-50 transition"
                >
                  ✏️ Edit Item
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  style={{
                    flex: 1,
                    border: "2px solid #fecaca",
                    color: "#ef4444",
                    borderRadius: "12px",
                    fontFamily: "Syne, sans-serif",
                    background: "#fef2f2",
                    padding: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                  className="hover:bg-red-100 transition disabled:opacity-50"
                >
                  {deleteLoading ? "⏳..." : "🗑️ Delete Item"}
                </button>
              </div>
            )}

            {/* Not logged in */}
            {!user && (
              <div
                style={{
                  background: "#f0fdfb",
                  border: "1px solid #99f6e4",
                  borderRadius: "16px",
                }}
                className="p-5 text-center"
              >
                <p
                  style={{
                    color: "#0d9488",
                    fontFamily: "DM Sans, sans-serif",
                    fontWeight: 500,
                  }}
                  className="mb-3"
                >
                  Is item ko claim karne ke liye login karo
                </p>
                <Link
                  to="/login"
                  style={{
                    background: "linear-gradient(135deg, #0d9488, #0f766e)",
                    fontFamily: "Syne, sans-serif",
                    borderRadius: "10px",
                  }}
                  className="text-white px-6 py-2 font-bold hover:opacity-90 transition inline-block"
                >
                  Login Karo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Matches Section */}
      {matches.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-10">
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(13,148,136,0.1), rgba(13,148,136,0.05))",
              border: "1px solid rgba(13,148,136,0.2)",
              borderRadius: "20px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "Syne, sans-serif",
                color: "#0a0f1e",
                fontSize: "1.3rem",
                fontWeight: 800,
                marginBottom: "4px",
              }}
            >
              🔍 Possible Matches Found!
            </h2>
            <p
              style={{
                color: "#64748b",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Yeh items tumhare item se match karte hain
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matches.map(({ item: match, score }) => (
                <Link to={`/item/${match._id}`} key={match._id}>
                  <div
                    style={{
                      background: "white",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      transition: "all 0.2s",
                    }}
                    className="hover:shadow-lg"
                  >
                    <div
                      style={{
                        height: "120px",
                        background: "#f0fdfb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        overflow: "hidden",
                      }}
                    >
                      {match.images?.length > 0 ? (
                        <img
                          src={`${match.images[0]}`}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "📦"
                      )}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <h4
                          style={{
                            fontFamily: "Syne, sans-serif",
                            color: "#1e293b",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                          className="truncate"
                        >
                          {match.title}
                        </h4>
                        <span
                          style={{
                            background: "#f0fdfb",
                            color: "#0d9488",
                            borderRadius: "6px",
                            padding: "2px 6px",
                            fontSize: "11px",
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            marginLeft: "6px",
                          }}
                        >
                          {score}%
                        </span>
                      </div>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontFamily: "DM Sans, sans-serif",
                          fontSize: "12px",
                        }}
                      >
                        📍 {match.location}
                      </p>
                      <div
                        style={{
                          marginTop: "8px",
                          background:
                            score >= 70
                              ? "#f0fdf4"
                              : score >= 50
                                ? "#fffbeb"
                                : "#f8fafc",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "Syne, sans-serif",
                            fontWeight: 600,
                            color:
                              score >= 70
                                ? "#16a34a"
                                : score >= 50
                                  ? "#ca8a04"
                                  : "#64748b",
                          }}
                        >
                          {score >= 70
                            ? "🔥 Strong Match"
                            : score >= 50
                              ? "⚡ Good Match"
                              : "🔍 Possible Match"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
