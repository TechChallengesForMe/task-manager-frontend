// Global variables
let currentView = 'all';
let tasks = [];
let currentDeleteId = null;

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date for input (datetime-local)
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
}

// Get status class for card
function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'in-progress': return 'status-in-progress';
        case 'completed': return 'status-completed';
        default: return 'status-pending';
    }
}

// Get status icon
function getStatusIcon(status) {
    switch(status) {
        case 'pending': return '📋';
        case 'in-progress': return '⚙️';
        case 'completed': return '✅';
        default: return '📋';
    }
}

// Filter tasks based on current view
function filterTasks() {
    if (currentView === 'all') {
        return tasks;
    }
    return tasks.filter(task => task.status === currentView);
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    $('#totalCount').text(total);
    $('#completedCount').text(completed);
}

// Render tasks to UI
function renderTasks() {
    const filteredTasks = filterTasks();
    const tasksList = $('#tasksList');
    
    if (filteredTasks.length === 0) {
        tasksList.html(`
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No tasks found</h3>
                <p>Click the "New Task" button to create your first task</p>
            </div>
        `);
        return;
    }
    
    let html = '<div class="tasks-grid">';
    filteredTasks.forEach(task => {
        html += `
            <div class="task-card ${task.status}">
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="task-status ${getStatusClass(task.status)}">
                        ${getStatusIcon(task.status)} ${task.status.replace('-', ' ')}
                    </span>
                    <span class="task-due">
                        <i class="far fa-calendar-alt"></i> ${formatDate(task.dueDate)}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="editTask(${task.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="confirmDelete(${task.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    tasksList.html(html);
    updateStats();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load all tasks from API
async function loadTasks() {
    try {
        $('#tasksList').html('<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Loading tasks...</p></div>');
        tasks = await TaskAPI.getAllTasks();
        renderTasks();
    } catch (error) {
        $('#tasksList').html(`
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading tasks</h3>
                <p>Make sure the backend server is running on port 8080</p>
            </div>
        `);
    }
}

// Create or update task
async function saveTask(event) {
    event.preventDefault();
    
    const taskId = $('#taskId').val();
    const taskData = {
        title: $('#title').val(),
        description: $('#description').val() || null,
        status: $('#status').val(),
        dueDate: $('#dueDate').val()
    };
    
    try {
        if (taskId) {
            // Update existing task
            await TaskAPI.updateTask(taskId, taskData);
            showNotification('Task updated successfully!', 'success');
        } else {
            // Create new task
            await TaskAPI.createTask(taskData);
            showNotification('Task created successfully!', 'success');
        }
        
        // Close modal and refresh
        closeModal();
        await loadTasks();
    } catch (error) {
        showNotification('Error saving task. Please try again.', 'error');
        console.error(error);
    }
}

// Edit task
window.editTask = async function(id) {
    try {
        const task = await TaskAPI.getTaskById(id);
        
        $('#modalTitle').text('Edit Task');
        $('#taskId').val(task.id);
        $('#title').val(task.title);
        $('#description').val(task.description || '');
        $('#status').val(task.status);
        $('#dueDate').val(formatDateForInput(task.dueDate));
        
        $('#taskModal').fadeIn();
    } catch (error) {
        showNotification('Error loading task details', 'error');
    }
};

// Confirm delete
window.confirmDelete = function(id) {
    currentDeleteId = id;
    $('#deleteModal').fadeIn();
};

// Delete task
async function deleteTask() {
    if (!currentDeleteId) return;
    
    try {
        await TaskAPI.deleteTask(currentDeleteId);
        showNotification('Task deleted successfully!', 'success');
        closeDeleteModal();
        await loadTasks();
    } catch (error) {
        showNotification('Error deleting task', 'error');
    }
}

// Show notification
function showNotification(message, type) {
    const notification = $(`
        <div class="notification ${type}" style="
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            border-radius: 8px;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        ">
            ${message}
        </div>
    `);
    
    $('body').append(notification);
    
    setTimeout(() => {
        notification.fadeOut(() => notification.remove());
    }, 3000);
}

// Modal functions
function openNewTaskModal() {
    $('#modalTitle').text('Create New Task');
    $('#taskForm')[0].reset();
    $('#taskId').val('');
    $('#dueDate').val(new Date().toISOString().slice(0, 16));
    $('#taskModal').fadeIn();
}

function closeModal() {
    $('#taskModal').fadeOut();
    $('#taskForm')[0].reset();
}

function closeDeleteModal() {
    $('#deleteModal').fadeOut();
    currentDeleteId = null;
}

// Change view
function changeView(view) {
    currentView = view;
    
    // Update active nav item
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-view="${view}"]`).addClass('active');
    
    // Update page title
    const titles = {
        'all': 'All Tasks',
        'pending': 'Pending Tasks',
        'in-progress': 'In Progress Tasks',
        'completed': 'Completed Tasks'
    };
    $('#pageTitle').text(titles[view]);
    
    // Re-render tasks
    renderTasks();
}

// Event handlers
$(document).ready(function() {
    // Load initial tasks
    loadTasks();
    
    // Navigation
    $('.nav-item').click(function(e) {
        e.preventDefault();
        const view = $(this).data('view');
        changeView(view);
    });
    
    // New task button
    $('#newTaskBtn').click(openNewTaskModal);
    
    // Form submission
    $('#taskForm').submit(saveTask);
    
    // Cancel buttons
    $('#cancelBtn, .close-modal').click(closeModal);
    $('#cancelDeleteBtn, .close-delete-modal').click(closeDeleteModal);
    
    // Confirm delete
    $('#confirmDeleteBtn').click(deleteTask);
    
    // Close modal on outside click
    $(window).click(function(e) {
        if ($(e.target).is('#taskModal')) {
            closeModal();
        }
        if ($(e.target).is('#deleteModal')) {
            closeDeleteModal();
        }
    });
    
    // Add animation styles
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `)
        .appendTo('head');
});