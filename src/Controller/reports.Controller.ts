import { Request, Response, query } from 'express';
import db from '../services/db.service';


// GET /api/projects/:projectId/reports: Get all reports for a specific project
export const getAllReportsForProject = (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const reports = db.query('SELECT * FROM reports WHERE projectId = @projectId', { projectId });
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// GET /api/reports/:id: Get a specific report by ID
export const getReportById = (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const report = db.query('SELECT * FROM reports WHERE id = @reportId', { reportId });
        if (report.length === 0) {
            res.status(404).json({ error: 'Report not found' });
        } else {
            res.json(report[0]);
        }
    } catch (error) {
        console.error('Error fetching report by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// POST /api/projects/:projectId/reports: Create a new report for a specific project
export const createReportForProject = (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { id, text } = req.body;
        const result = db.run('INSERT INTO reports (id, text, projectId) VALUES (@id, @text, @projectId)', {
            id,
            text,
            projectId,
        });
        res.status(201).json({ id: result.lastInsertRowid, text, projectId });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// PUT /api/reports/:id: Update a report by ID
export const updateReportById = (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { title, description } = req.body;
        const result = db.run('UPDATE reports SET title = @name, description = @description, WHERE id = @projectId', {
            title,
            description,
            projectId,
        });
        if (result.changes === 0) {
            res.status(404).json({ error: 'Report not found' });
        } else {
            res.json({ projectId, title, description });
        }
    } catch (error) {
        console.error('Error updating report by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// DELETE /api/reports/:id: Delete a report by ID
export const deleteReportById = (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const result = db.run('DELETE FROM reports WHERE id = @reportId', { reportId });
        if (result.changes === 0) {
            res.status(404).json({ error: 'Report not found' });
        } else {
            res.json({ message: 'Report deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting report by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getReportsWithRepeatedWords = async (req: Request, res: Response) => {
    try {
        // const { projectId } = req.params;
        console.log("hello");
        // Fetch all reports for the specified project
        const sql = `
            SELECT id, text, projectid
            FROM reports
        `;

        const reports = db.query(sql) as { id: string, text: string, projectid: string }[];
        console.log(reports);


        const reportsWithRepeatedWords = reports.filter(report => {
            const wordCounts = report.text
                .toLowerCase() // Convert to lower case to count words case-insensitively
                .replace(/[^\w\s]/gi, '') // Remove punctuation
                .split(/\s+/) // Split by whitespace
                .reduce((counts, word) => {
                    counts[word] = (counts[word] || 0) + 1;
                    return counts;
                }, {} as Record<string, number>);

            // Check if any word appears at least three times
            return Object.values(wordCounts).some(count => count >= 3);
        });

        res.json(reportsWithRepeatedWords);
    } catch (error) {
        console.error('Error fetching reports with repeated words:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
