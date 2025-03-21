# Task Priority Ranker

An Obsidian plugin that helps you prioritize your tasks through a simple comparison-based ranking system.

## Overview

Task Priority Ranker makes it easy to organize your tasks by relative importance. Rather than trying to assign arbitrary priority numbers to each task, this plugin lets you compare tasks directly in pairs and decide which one is more important. Over time, this builds a priority ranking across all your tasks.

## How it Works

The plugin works using a pairwise comparison approach:

1. It scans your vault for incomplete tasks (checkbox items formatted as `- [ ] Task description`)
2. It presents you with two tasks at a time, asking you to choose which one has higher priority
3. When you select a task, its priority value is increased
4. The plugin focuses on comparing tasks with the same priority level, gradually resolving all priority ties
5. Tasks are tagged with `[priority:: N]` where N is a number representing the task's priority level

## Usage

### Starting the Ranker

You can open the Task Priority Ranker in two ways:

- Click the "list-ordered" icon in the ribbon (left sidebar)
- Use the command palette and select "Open Task Priority Ranker"

### Ranking Tasks

1. When the modal opens, you'll see two tasks presented side-by-side
2. Click on the task that you believe has higher priority
3. The selected task will have its priority value increased
4. Continue comparing pairs until all tasks have unique priority values

### Understanding Progress

At the bottom of the comparison modal, you'll see a counter showing the number of remaining duplicated priorities. This indicates how many more comparisons might be needed to fully rank your tasks.

## Installation

1. In Obsidian, go to Settings > Community Plugins
2. Disable Safe Mode
3. Click "Browse" and search for "Task Priority Ranker"
4. Install the plugin and enable it

## Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the ZIP file into your `.obsidian/plugins/` directory
3. Enable the plugin in Obsidian's Community Plugins settings

## Features

- Simple pairwise comparison interface
- Automatically scans your entire vault for tasks
- Non-destructive: Preserves all your task content, only adds/updates priority tags
- Shows source file for each task to provide context
- Visual progress tracking

## Technical Notes

- The plugin adds a `[priority:: N]` tag to each task
- Higher numbers indicate higher priority
- Tasks start with a default priority of 0 if no priority tag is present
- The plugin focuses on comparing tasks with equal priorities to efficiently resolve ties

## Integration with Obsidian Tasks Plugin

The Task Priority Ranker plugin adds `[priority:: N]` tags to your tasks which can be used with the popular [Obsidian Tasks Plugin](https://github.com/obsidian-tasks-group/obsidian-tasks) to create powerful filtered and sorted task lists.

### Sorting Tasks by Priority

You can use the following Tasks query to display all your tasks sorted by their priority values (highest priority first):

```tasks
not done
show backlink
sort by function -Number(task.description.match(/priority:: (\d+)/)?.[1] ?? 0)
```

This query:
- Shows only uncompleted tasks (`not done`)
- Includes a link back to the source note (`show backlink`)
- Sorts tasks in descending order by their priority value (`sort by function`)
- Uses a negative sign to sort from highest to lowest priority

### Filtering by Priority

You can also filter tasks to show only those above a certain priority threshold:

```tasks
not done
show backlink
path includes {{query.file.path}}
sort by function -Number(task.description.match(/priority:: (\d+)/)?.[1] ?? 0)
filter by function Number(task.description.match(/priority:: (\d+)/)?.[1] ?? 0) >= 5
```

This will show only tasks with a priority of 5 or higher, helping you focus on your most important tasks.

### Note

The Obsidian Tasks Plugin is a separate plugin that must be installed independently. Task Priority Ranker is designed to work seamlessly alongside it, giving you the best of both worlds - easy priority ranking and powerful task queries.

## Troubleshooting

If you encounter issues with task updates not being saved:
- Make sure you have write permissions for your vault
- Check for any unusual formatting in your task items
- Restart Obsidian and try again

## Support

For bug reports or feature requests, please create an issue on the GitHub repository.

## License

[MIT License](LICENSE)
