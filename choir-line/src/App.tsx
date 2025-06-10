import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { v4 as uuidv4 } from "uuid";

const parts = ["Soprano", "Alto", "Tenor", "Bass"] as const;
type Part = (typeof parts)[number];
interface Member {
    id: string;
    name: string;
    part: Part;
}

const partColors: Record<Part, string> = {
    Soprano: "#ffe0e6",
    Alto: "#e0ffe3",
    Tenor: "#e0f0ff",
    Bass: "#fff5cc",
};

const ItemType = "MEMBER";

const App: React.FC = () => {
    const [counts, setCounts] = useState<Record<Part, number>>({
        Soprano: 10,
        Alto: 10,
        Tenor: 5,
        Bass: 5,
    });
    const [rowCount, setRowCount] = useState(3);
    const [layoutMode, setLayoutMode] = useState<"auto" | "condition1" | "condition2">("auto");
    const [rows, setRows] = useState<(Member | null)[][]>([]);

    const generateMembers = () => {
        const soprano = Array.from({ length: counts.Soprano }, (_, i) => ({
            id: uuidv4(),
            name: `S${i + 1}`,
            part: "Soprano" as Part,
        }));
        const alto = Array.from({ length: counts.Alto }, (_, i) => ({
            id: uuidv4(),
            name: `A${i + 1}`,
            part: "Alto" as Part,
        }));
        const tenor = Array.from({ length: counts.Tenor }, (_, i) => ({
            id: uuidv4(),
            name: `T${i + 1}`,
            part: "Tenor" as Part,
        }));
        const bass = Array.from({ length: counts.Bass }, (_, i) => ({
            id: uuidv4(),
            name: `B${i + 1}`,
            part: "Bass" as Part,
        }));

        const newRows: (Member | null)[][] = Array.from({ length: rowCount }, () => []);

        const flatInsert = (members: Member[], targetRows: number[]) => {
            let i = 0;
            for (const m of members) {
                const row = targetRows[i % targetRows.length];
                newRows[row].push(m);
                i++;
            }
        };

        if (layoutMode === "condition1") {
            flatInsert([...alto, ...soprano], [0, 1]);
            flatInsert([...bass, ...tenor], [2]);
        } else if (layoutMode === "condition2") {
            flatInsert([...alto, ...soprano], [0, 1, 2]);
            flatInsert([...bass, ...tenor], [3]);
        } else {
            if (rowCount === 3) {
                flatInsert([...alto, ...soprano], [0, 1]);
                flatInsert([...bass, ...tenor], [2]);
            } else if (rowCount >= 4) {
                flatInsert([...alto, ...soprano], [0, 1, 2]);
                flatInsert([...bass, ...tenor], [rowCount - 1]);
            } else {
                flatInsert(
                    [...alto, ...soprano, ...tenor, ...bass],
                    Array.from({ length: rowCount }, (_, i) => i)
                );
            }
        }

        const max = Math.max(...newRows.map((r) => r.length));
        const padded = newRows.map((row) => {
            const diff = max - row.length;
            const padLeft = Math.floor(diff / 2);
            const padRight = diff - padLeft;
            return [...Array(padLeft).fill(null), ...row, ...Array(padRight).fill(null)];
        });

        setRows(padded);
    };

    useEffect(() => {
        generateMembers();
    }, []);

    const moveMember = (fromRow: number, fromIndex: number, toRow: number, toIndex: number) => {
        setRows((prev) => {
            const newRows = [...prev.map((row) => [...row])];
            const dragged = newRows[fromRow][fromIndex];
            newRows[fromRow][fromIndex] = newRows[toRow][toIndex];
            newRows[toRow][toIndex] = dragged;
            return newRows;
        });
    };

    const maxCount = Math.max(...rows.map((r) => r.length), 0);
    const totalCount = Object.values(counts).reduce((sum, val) => sum + val, 0);

    return (
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
            <div style={{ padding: 20 }}>
                <div
                    style={{
                        marginBottom: 30,
                        border: "1px solid #ddd",
                        borderRadius: 16,
                        padding: 25,
                        background: "linear-gradient(145deg, #ffffff, #f1f1f1)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
                        maxWidth: 1000,
                        margin: "0 auto 50px",
                    }}
                >
                    <h2 style={{ marginBottom: 10, textAlign: "center" }}>입력 설정</h2>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 24,
                            justifyContent: "center",
                            alignItems: "flex-end",
                            marginBottom: 15,
                        }}
                    >
                        {parts.map((part) => (
                            <div
                                key={part}
                                style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90 }}
                            >
                                <label style={{ fontWeight: 600, color: "#333", marginBottom: 5 }}>{part}</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={counts[part]}
                                    onChange={(e) =>
                                        setCounts((prev) => ({ ...prev, [part]: parseInt(e.target.value) || 0 }))
                                    }
                                    style={{
                                        padding: "6px 10px",
                                        width: "100%",
                                        textAlign: "center",
                                        borderRadius: 6,
                                        border: "1px solid #ccc",
                                        outline: "none",
                                        fontSize: 14,
                                    }}
                                />
                            </div>
                        ))}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 90 }}>
                            <label style={{ fontWeight: 600, color: "#333", marginBottom: 5 }}>줄 수</label>
                            <input
                                type="number"
                                min="1"
                                value={rowCount}
                                onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                                style={{
                                    padding: "6px 10px",
                                    width: "100%",
                                    textAlign: "center",
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    outline: "none",
                                    fontSize: 14,
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 120 }}>
                            <label style={{ fontWeight: 600, color: "#333", marginBottom: 5 }}>전체 인원 수</label>
                            <input
                                type="number"
                                value={totalCount}
                                readOnly
                                style={{
                                    padding: "6px 10px",
                                    width: "100%",
                                    textAlign: "center",
                                    backgroundColor: "#e9ecef",
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    fontSize: 14,
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 220 }}>
                            <label style={{ fontWeight: 600, color: "#333", marginBottom: 5 }}>배치 조건</label>
                            <select
                                value={layoutMode}
                                onChange={(e) => setLayoutMode(e.target.value as any)}
                                disabled={rowCount < 4 && layoutMode === "condition2"}
                                style={{
                                    padding: "6px 10px",
                                    width: "100%",
                                    textAlign: "center",
                                    borderRadius: 6,
                                    border: "1px solid #ccc",
                                    fontSize: 14,
                                }}
                            >
                                <option value="auto">자동</option>
                                <option value="condition1">조건1 (Alto→Soprano, Tenor→Bass)</option>
                                <option value="condition2" disabled={rowCount < 4}>
                                    조건2 (Alto→Soprano, Tenor→Bass)
                                </option>
                            </select>
                        </div>
                        <button
                            onClick={generateMembers}
                            style={{
                                padding: "10px 20px",
                                background: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                fontSize: 14,
                                height: 44,
                            }}
                        >
                            전체 재배치
                        </button>
                    </div>
                </div>

                <div style={{ maxWidth: "100vw", overflowX: "auto" }}>
                    {rows.map((row, i) => (
                        <Row key={i} rowIndex={i} members={row} moveMember={moveMember} maxCount={maxCount} />
                    ))}
                </div>
            </div>
        </DndProvider>
    );
};

const Row: React.FC<{
    rowIndex: number;
    members: (Member | null)[];
    moveMember: (fromRow: number, fromIndex: number, toRow: number, toIndex: number) => void;
    maxCount: number;
}> = ({ rowIndex, members, moveMember, maxCount }) => {
    const memberWidth = 110;
    const indent = (rowIndex % 2) * (memberWidth / 2);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
                flexWrap: "nowrap",
                gap: 10,
                marginLeft: indent,
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            {members.map((member, index) => (
                <DraggableMember key={index} member={member} index={index} row={rowIndex} moveMember={moveMember} />
            ))}
        </div>
    );
};

const DraggableMember: React.FC<{
    member: Member | null;
    index: number;
    row: number;
    moveMember: (fromRow: number, fromIndex: number, toRow: number, toIndex: number) => void;
}> = ({ member, index, row, moveMember }) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: ItemType,
        item: { index, row },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }));

    const [, dropRef] = useDrop(() => ({
        accept: ItemType,
        drop: (item: { index: number; row: number }) => {
            moveMember(item.row, item.index, row, index);
        },
    }));

    return (
        <div
            ref={(node) => {
                if (node) dragRef(dropRef(node));
            }}
            style={{
                padding: 10,
                width: 100,
                height: 50,
                backgroundColor: member ? partColors[member.part] : "#f0f0f0",
                border: "1px dashed #ccc",
                opacity: isDragging ? 0.5 : 1,
                textAlign: "center",
                cursor: "move",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
                flexShrink: 0,
            }}
        >
            {member ? (
                <>
                    <strong>{member.name}</strong>
                    <div style={{ fontSize: 12 }}>{member.part}</div>
                </>
            ) : (
                <div style={{ color: "#ccc", fontSize: 12 }}>빈자리</div>
            )}
        </div>
    );
};

export default App;
