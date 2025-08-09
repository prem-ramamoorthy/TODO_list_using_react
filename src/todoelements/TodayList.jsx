import React, { useState, useEffect } from "react";
import style from "./style.module.css";

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getLocalYMD = (date = new Date()) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

function TodayList() {
    const todayISO = getLocalYMD();

    const defaultTodayTask = {
        id: makeId(),
        priority: "high",
        name: "Sample Task (Today)",
        due: todayISO,
    };

    const defaultUpcomingTask = {
        id: makeId(),
        priority: "medium",
        name: "Sample Task (Upcoming)",
        due: getLocalYMD(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
    };

    const getInitialState = (key, defaultValue) => {
        const saved = localStorage.getItem(key);
        if (!saved) {
            return defaultValue;
        }
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed)
                ? parsed.map((task) => ({ ...task, id: task.id ?? makeId() }))
                : defaultValue;
        } catch (error) {
            console.error(`Error parsing ${key} from localStorage`, error);
            return defaultValue;
        }
    };

    const [todoList, setTodoList] = useState(() => getInitialState("tasks", [defaultTodayTask]));
    const [upcoming, setUpcoming] = useState(() => getInitialState("upcoming", [defaultUpcomingTask]));
    const [completed, setCompleted] = useState(() => getInitialState("completed", []));

    const [taskNameInput, setTaskNameInput] = useState("");
    const [taskDateInput, setTaskDateInput] = useState("");
    const [priorityInput, setPriorityInput] = useState("high");

    const getColor = (priority) => {
        if (priority === "high") return { borderLeft: "3px solid rgba(255,0,0,1)" };
        if (priority === "medium") return { borderLeft: "3px solid rgba(255,183,0,1)" };
        return { borderLeft: "3px solid rgba(0,106,255,1)" };
    };

    const getColor1 = (priority) => {
        if (priority === "high") return { backgroundColor: "rgba(255,40,40,1)" };
        if (priority === "medium") return { backgroundColor: "rgba(255,191,29,1)" };
        return { backgroundColor: "rgba(30,124,255,1)" };
    };

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(todoList));
    }, [todoList]);

    useEffect(() => {
        localStorage.setItem("upcoming", JSON.stringify(upcoming));
    }, [upcoming]);

    useEffect(() => {
        localStorage.setItem("completed", JSON.stringify(completed));
    }, [completed]);

    const addTask = () => {
        if (!taskNameInput.trim() || !taskDateInput) {
            alert("Please fill in all fields");
            return;
        }

        const newTask = {
            id: makeId(),
            priority: priorityInput,
            name: taskNameInput.trim(),
            due: taskDateInput,
        };

        const allTasks = [...todoList, ...upcoming];
        const exists = allTasks.some(
            (t) =>
                t.name === newTask.name &&
                t.due === newTask.due &&
                t.priority === newTask.priority
        );

        if (exists) {
            alert("Task already exists!");
            return;
        }

        if (newTask.due === todayISO) {
            setTodoList((prev) => [...prev, newTask]);
        } else {
            setUpcoming((prev) => [...prev, newTask]);
        }

        setTaskNameInput("");
        setTaskDateInput("");
        setPriorityInput("high");
    };

    const markAsCompleted = (id, sourceList, setSourceList) => {
        const task = sourceList.find((t) => t.id === id);
        if (!task) return;

        setCompleted((prev) => [...prev, task]);
        setSourceList((prev) => prev.filter((t) => t.id !== id));
    };

    const renderTasks = (tasks, onCheckboxChange) =>
        tasks.map((task) => (
            <li key={task.id} style={getColor(task.priority)}>
                <div>
                    <input type="checkbox" onChange={() => onCheckboxChange(task.id)} />
                    <p>{task.name}</p>
                </div>
                <div>
                    <p
                        style={getColor1(task.priority)}
                        className={style?.priority || "priority"}
                    >
                        {task.priority}
                    </p>
                    <p>{task.due}</p>
                </div>
            </li>
        ));

    return (
        <>
            <h1>Todo List</h1>
            <div className="container0">
                <input
                    type="text"
                    placeholder="Enter the Task"
                    value={taskNameInput}
                    onChange={(e) => setTaskNameInput(e.target.value)}
                />
                <input
                    type="date"
                    value={taskDateInput}
                    onChange={(e) => setTaskDateInput(e.target.value)}
                />
                <select
                    value={priorityInput}
                    onChange={(e) => setPriorityInput(e.target.value)}
                >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <button onClick={addTask}>Add Task</button>
            </div>

            <div className="main">
                <div className="container1">
                    <h2>Today's Task</h2>
                    <ul>{renderTasks(todoList, (id) => markAsCompleted(id, todoList, setTodoList))}</ul>
                </div>
                <div className="container1">
                    <h2>Upcoming</h2>
                    <ul>{renderTasks(upcoming, (id) => markAsCompleted(id, upcoming, setUpcoming))}</ul>
                </div>
                <div className="container1">
                    <h2>Completed</h2>
                    <ul className="remove">{renderTasks(completed, () => { })}</ul>
                </div>
            </div>
        </>
    );
}

export default TodayList;
