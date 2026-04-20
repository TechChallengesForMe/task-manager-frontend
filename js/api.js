// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Task API Service
const TaskAPI = {
    // Get all tasks
    async getAllTasks() {
        try {
            const response = await $.ajax({
                url: `${API_BASE_URL}/tasks`,
                method: 'GET',
                contentType: 'application/json'
            });
            return response;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    // Get task by ID
    async getTaskById(id) {
        try {
            const response = await $.ajax({
                url: `${API_BASE_URL}/tasks/${id}`,
                method: 'GET',
                contentType: 'application/json'
            });
            return response;
        } catch (error) {
            console.error('Error fetching task:', error);
            throw error;
        }
    },

    // Create new task
    async createTask(taskData) {
        try {
            const response = await $.ajax({
                url: `${API_BASE_URL}/tasks`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(taskData)
            });
            return response;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Update task
    async updateTask(id, taskData) {
        try {
            const response = await $.ajax({
                url: `${API_BASE_URL}/tasks/${id}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(taskData)
            });
            return response;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Update task status
    async updateTaskStatus(id, status) {
        try {
            const response = await $.ajax({
                url: `${API_BASE_URL}/tasks/${id}/status`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(status)
            });
            return response;
        } catch (error) {
            console.error('Error updating task status:', error);
            throw error;
        }
    },

    // Delete task
    async deleteTask(id) {
        try {
            await $.ajax({
                url: `${API_BASE_URL}/tasks/${id}`,
                method: 'DELETE'
            });
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }
};