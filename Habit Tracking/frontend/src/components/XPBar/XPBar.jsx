import { useEffect } from "react";
import { useAuth } from "../../context/AuthProvider";
import "./xpBar.css";
import instance from "../../../axisInstance";
import { useState } from "react";

export default function XPBar({
    className = "",
    style = {},
}) {
   

    const { user } = useAuth();

    const [userXPData, setUserXPData] = useState({
        level: 0,
        xp: 0,
        max_xp: 100,
        percentage: 0
    });

    useEffect(() => {
        
        instance.get("/auth/me").then(res => {
            console.log(res.data);
             const percentage = Math.min(
                (res.data.xp / res.data.max_xp) * 100,
                100
            );
            setUserXPData({
                level: res.data.level,
                xp: res.data.xp,
                max_xp: res.data.max_xp,
                percentage: percentage
            })
        }).catch(err => {
            console.log("Error", err)
            alert(err.response.data.message)
        })

    }, []);

    return (
        <div className={`xp-bar-container ${className}`} style={style}>
            <div className="level-badge">
                <span className="level-label">Welcome Player, {user?.username?.toUpperCase()}</span>
            </div>
            <div className="level-badge">
                <span className="level-label">LEVEL</span>
                <div className="level-circle">
                    <span className="level-value">{userXPData.level}</span>
                </div>
            </div>

            <div className="xp-bar">
                <div
                    className="xp-fill"
                    style={{ width: `${userXPData.percentage}%` }}
                />
            </div>

            <div className="xp-text">
                {userXPData.xp} / {userXPData.max_xp} XP
            </div>
        </div>
    );
}
