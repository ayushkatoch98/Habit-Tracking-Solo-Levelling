import Popup from "../Popup/Popup";
import Input from "../Input/Input";
import Button from "../Button/Button";

import "./adminPopup.css"

import { QUEST_TYPE } from "../../utils/constant";


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
                
                {entity === "QUEST" && (
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
                            name="quest_xp"
                            className="system-input"
                            placeholder="XP Reward"
                            type="number"
                            defaultValue={data?.quest_xp}
                            required
                        />

                        <input
                            name="failed_xp"
                            className="system-input"
                            placeholder="Failed XP"
                            type="number"
                            defaultValue={data?.failed_xp}
                            required
                        />


                        <select
                            name="quest_type"
                            defaultValue={data?.quest_type}
                            className="system-select"
                        >
                            <option value={QUEST_TYPE.DAILY_QUEST}>Daily Quest</option>
                            <option value={QUEST_TYPE.WEEKLY_QUEST}>Weekly Quest</option>
                            <option value={QUEST_TYPE.PENALTY}>Penalty</option>

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
