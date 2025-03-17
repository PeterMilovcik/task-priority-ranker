"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class Task {
    constructor(text, path) {
        this.originalText = text; // Save the original text
        // Extract existing priority if present
        const priorityMatch = text.match(/\[priority:: (\d+)\]/);
        const existingPriority = priorityMatch ? parseInt(priorityMatch[1]) : 0;
        // Remove all priority tags
        this.text = text.replace(/\[priority::\s*\d+\]/g, '').trim();
        // Add the priority tag with the correct value (existing or default)
        this.text = `- [ ] [priority:: ${existingPriority}] ${this.text.replace(/^- \[ \]\s*/, '')}`;
        this.path = path;
    }
    getPriority() {
        const match = this.text.match(/\[priority:: (\d+)\]/);
        return match ? parseInt(match[1]) : 0;
    }
    setPriority(newPriority) {
        // Remove all priority tags first
        this.text = this.text.replace(/\[priority::\s*\d+\]/g, '').trim();
        this.text = `- [ ] [priority:: ${newPriority}] ${this.text.replace(/^- \[ \]\s*/, '')}`;
    }
}
class TaskPriorityRanker extends obsidian_1.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.addRibbonIcon("list-ordered", "Open Task Ranker", () => {
                console.log("🔹 Task Priority Ranker opened via Ribbon icon.");
                this.openRankingUI();
            });
            this.addCommand({
                id: "open-task-priority-ranker",
                name: "Open Task Priority Ranker",
                callback: () => {
                    console.log("🔹 Task Priority Ranker opened via Command Palette.");
                    this.openRankingUI();
                },
            });
        });
    }
    openRankingUI() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("📌 Fetching tasks...");
            const tasks = yield this.getTasks();
            console.log("📌 Retrieved tasks:", tasks);
            if (tasks.length < 2) {
                new obsidian_1.Notice("Not enough tasks for ranking!");
                console.warn("⚠ Not enough tasks available for ranking.");
                return;
            }
            this.createTaskComparisonUI();
        });
    }
    getTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            let tasks = [];
            for (const file of this.app.vault.getMarkdownFiles()) {
                const content = yield this.app.vault.read(file);
                const lines = content.split("\n");
                lines.forEach(line => {
                    if (line.match(/- \[ \].*/)) {
                        tasks.push(new Task(line, file.path));
                    }
                });
            }
            console.log("📌 Found tasks before priority assignment:", tasks);
            // Sort tasks by priority
            tasks.sort((a, b) => a.getPriority() - b.getPriority());
            console.log("📌 Tasks after sorting by priority:", tasks);
            return tasks;
        });
    }
    updateTaskPriority(task, newPriority) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`🔹 Attempting to update priority for task: "${task.text}" → New Priority: ${newPriority}`);
            const file = this.app.vault.getAbstractFileByPath(task.path);
            if (!(file instanceof obsidian_1.TFile)) {
                console.error("❌ Error: File not found!", task.path);
                return;
            }
            let content = yield this.app.vault.read(file);
            console.log(`📌 File Content Before Update:\n${content}`);
            // First, try to find the original task text from the file
            if (content.includes(task.originalText)) {
                console.log(`📌 Found original task: "${task.originalText}"`);
                // Create the updated task with new priority
                task.setPriority(newPriority);
                const updatedTaskText = task.text;
                // Replace the original task with the updated one
                const updatedContent = content.replace(task.originalText, updatedTaskText);
                console.log(`📌 File Content After Update:\n${updatedContent}`);
                // Apply the changes
                yield this.app.vault.modify(file, updatedContent);
                console.log(`✅ Successfully updated task in file: ${task.path}`);
                return;
            }
            // If original text is not found, try the fallback method
            console.log(`⚠️ Original task text not found, trying alternative method...`);
            // Get the base task text without any priority tag
            const baseTaskText = task.text.replace(/\[priority::\s*\d+\]/g, '').trim();
            // Try to find the exact task, considering it might or might not have a priority tag
            const escapedBaseTask = baseTaskText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const taskPattern = new RegExp(`- \\[ \\]\\s*(?:\\[priority::\\s*\\d+\\]\\s*)?${escapedBaseTask.replace(/^- \[ \]\s*/, '')}`, 'm');
            const match = content.match(taskPattern);
            if (!match) {
                console.error("❌ Error: Task not found in file! Aborting update.");
                console.error(`🔎 Expected to find: "${baseTaskText}"`);
                return;
            }
            const matchedTask = match[0].trim();
            task.setPriority(newPriority);
            const updatedTaskText = task.text;
            // Replace only the exact matching task in the file
            const updatedContent = content.replace(matchedTask, updatedTaskText);
            console.log(`📌 File Content After Update:\n${updatedContent}`);
            // Apply the changes
            yield this.app.vault.modify(file, updatedContent);
            console.log(`✅ Successfully updated task in file: ${task.path}`);
        });
    }
    createTaskComparisonUI() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("📌 Opening Task Ranking Modal...");
            const modal = new TaskRankingModal(this.app, this);
            modal.open();
        });
    }
}
exports.default = TaskPriorityRanker;
const obsidian_2 = require("obsidian");
class TaskRankingModal extends obsidian_2.Modal {
    constructor(app, plugin) {
        super(app);
        this.tasks = [];
        this.progressInfoElement = null;
        this.plugin = plugin;
        this.modalEl.style.width = "1200px";
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("📌 Task ranking modal opened.");
            yield this.refreshAndDisplay();
        });
    }
    refreshAndDisplay() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔄 Refreshing task list...");
            this.tasks = yield this.plugin.getTasks();
            console.log("📌 Updated tasks for ranking:", this.tasks);
            this.displayNextPair();
        });
    }
    displayNextPair() {
        return __awaiter(this, void 0, void 0, function* () {
            this.contentEl.empty();
            if (this.tasks.length < 2) {
                this.contentEl.createEl("h2", { text: "✅ All tasks ranked!" });
                console.log("🎉 All tasks are ranked. Closing modal.");
                return;
            }
            // Group tasks by their priority [priority:: <value>]
            const groupedTasks = {};
            for (const task of this.tasks) {
                const priority = task.getPriority();
                if (!groupedTasks[priority])
                    groupedTasks[priority] = [];
                groupedTasks[priority].push(task);
            }
            // Get priority levels in ascending order
            const sortedPriorities = Object.keys(groupedTasks)
                .map(Number)
                .sort((a, b) => a - b);
            let task1 = null, task2 = null;
            // Find two tasks with the same priority, starting from the lowest
            for (let priority of sortedPriorities) {
                if (groupedTasks[priority].length > 1) {
                    task1 = groupedTasks[priority].pop();
                    task2 = groupedTasks[priority].pop();
                    break;
                }
            }
            // Calculate the number of duplicated priority tasks
            let duplicatedPriorities = 0;
            for (const priority of sortedPriorities) {
                if (groupedTasks[priority].length > 1) {
                    duplicatedPriorities += groupedTasks[priority].length - 1;
                }
            }
            // If no pairs exist, stop ranking
            if (!task1 || !task2) {
                this.contentEl.createEl("h2", { text: "✅ All tasks ranked!" });
                console.log("🎉 All tasks are ranked. Closing modal.");
                return;
            }
            console.log(`🆚 Comparing tasks: ${task1.text} vs ${task2.text}`);
            this.createTaskUI(task1, task2, duplicatedPriorities);
        });
    }
    createTaskUI(task1, task2, duplicatedPriorities) {
        this.contentEl.empty();
        // Add the question at the top
        this.contentEl.createEl("h2", { text: "Which task has higher priority?", cls: "task-question" });
        const container = this.contentEl.createDiv({ cls: "task-comparison-container" });
        const createTaskPanel = (task, isTask1) => {
            var _a;
            const taskDiv = container.createDiv({ cls: "task-box clickable-task" });
            // Extract note title from path
            const taskFileName = ((_a = task.path.split("/").pop()) === null || _a === void 0 ? void 0 : _a.replace(".md", "")) || "Unknown Note";
            taskDiv.createEl("h3", { text: `📄 ${taskFileName}`, cls: "task-title" }); // 🔥 Title at the top
            taskDiv.createEl("p", { text: task.text, cls: "task-content" });
            taskDiv.onclick = () => __awaiter(this, void 0, void 0, function* () {
                console.log(`🖱 Clicked: ${isTask1 ? "Task 1" : "Task 2"} is Higher → ${task.text} (from ${taskFileName})`);
                // Increase priority only for the selected task
                yield this.plugin.updateTaskPriority(task, task.getPriority() + 1);
                console.log("🕒 Waiting for file update...");
                yield new Promise(resolve => setTimeout(resolve, 500));
                yield this.refreshAndDisplay();
            });
            return taskDiv;
        };
        container.appendChild(createTaskPanel(task1, true));
        container.appendChild(createTaskPanel(task2, false));
        this.contentEl.appendChild(container);
        // ✅ Ensure progress info updates instead of being replaced
        if (!this.progressInfoElement) {
            this.progressInfoElement = this.contentEl.createEl("p", {
                text: `🔄 Number of duplicated priorities: ${duplicatedPriorities}`,
                cls: "task-progress-info"
            });
        }
        else {
            this.progressInfoElement.textContent = `🔄 Number of duplicated priorities: ${duplicatedPriorities}`;
        }
        // Ensure it's at the bottom of the modal
        this.contentEl.appendChild(this.progressInfoElement);
    }
}
