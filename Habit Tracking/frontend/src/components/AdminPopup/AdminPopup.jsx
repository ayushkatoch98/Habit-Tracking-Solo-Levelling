import Popup from "../Popup/Popup";
import Input from "../Input/Input";
import Button from "../Button/Button";

import "./adminPopup.css"

export default function AdminPopup({
    open,
    mode,
    entity,
    data,
    onClose,
    onSubmit,
}) {
    if (!open) return null;

    const isEdit = mode === "edit";

    const title = `${isEdit ? "EDIT" : "CREATE"} ${entity.toUpperCase()}`;

    const handleSubmit = (e, entity, isEdit) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(e.target));
        onSubmit(formData, entity, isEdit);
    };

    return (
        <Popup
            open={open}
            title={title}
            onClose={onClose}

        >
            <form className="admin-form" onSubmit={(e) => handleSubmit(e, entity, isEdit)}>
                {entity === "user" && (
                    <>
                        {isEdit && (
                            <input
                                name="id"
                                type="text"
                            className="system-input"
                                placeholder="User ID"
                                defaultValue={data?.id}
                                readOnly
                            />
                        )}
                        <input
                            name="username"
                            className="system-input"
                            type="text"
                            placeholder="Username"
                            defaultValue={data?.username}
                            required
                        />
                        <input
                            name="email"
                            className="system-input"
                            placeholder="Email"
                            type="email"
                            defaultValue={data?.email}
                        />
                        <input
                            name="password"
                            className="system-input"
                            placeholder="Password"
                            type="password"
                            defaultValue={data?.password}
                        />
                    </>
                )}

                {entity === "quest" && (
                    <>
                        {/* QUEST ID (ONLY ON EDIT) */}
                        {isEdit && (
                            <input
                                name="id"
                                type="text"
                                className="system-input"
                                placeholder="Quest ID"
                                defaultValue={data?.id}
                                readOnly
                            />
                        )}

                        <input
                            name="title"
                            type="text"
                            className="system-input"
                            placeholder="Quest Title"
                            defaultValue={data?.title}
                            required
                        />

                        <textarea
                            name="description"
                            placeholder="Quest Description"
                            defaultValue={data?.description}
                            className="system-textarea"
                            rows={3}
                        />

                        <input
                            name="xp_reward"
                            className="system-input"
                            placeholder="XP Reward"
                            type="number"
                            defaultValue={data?.xp_reward}
                            required
                        />

                        <select
                            name="quest_type"
                            defaultValue={data?.quest_type}
                            className="system-select"
                        >
                            <option value="daily_quest">Daily Quest</option>
                            <option value="weekly_quest">Weekly Quest</option>
                            <option value="penalty">Penalty</option>
                        </select>
                    </>
                )}

                <Button type="submit" form="admin-form">
                    {isEdit ? "Update" : "Create"}
                </Button>
            </form>
        </Popup>
    );
}
