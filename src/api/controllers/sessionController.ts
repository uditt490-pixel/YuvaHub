import { Request, Response } from 'express';
import { EventSession } from '../../models/EventSession';
import { logger } from '../../utils/logger';

/**
 * Fetches the collaborative agenda for a specific event.
 * Sessions are sorted by net votes (upvotes - downvotes) in descending order.
 */
export const getEventAgenda = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const { status } = req.query;

        const query: any = { eventId };
        if (status) {
            query.status = status;
        }

        const sessions = await EventSession.find(query)
            .populate('proposerId', 'name avatarUrl')
            .sort({ upvotes: -1, createdAt: -1 })
            .select('-votedBy'); // Exclude votedBy array from public response for performance

        res.status(200).json({
            success: true,
            data: sessions,
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching event agenda:');
        res.status(500).json({
            success: false,
            error: 'Internal server error while fetching agenda.',
        });
    }
};

/**
 * Creates a new session proposal via REST API (fallback or initial creation).
 * Real-time proposals are typically handled via WebSockets, but this provides a REST endpoint.
 */
export const proposeSession = async (req: Request, res: Response) => {
    try {
        const { eventId } = req.params;
        const { title, description, tags, startTime, durationMinutes } = req.body;
        const userId = (req as any).user?.uid;
        const userName = (req as any).user?.name || 'Anonymous';

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                error: 'Title and description are required.',
            });
        }

        const newSession = await EventSession.create({
            eventId: eventId as string,
            title,
            description,
            proposerId: userId,
            proposerName: userName,
            tags: tags || [],
            startTime: startTime ? new Date(startTime) : undefined,
            durationMinutes,
            status: 'proposed',
        });

        res.status(201).json({
            success: true,
            message: 'Session proposed successfully.',
            data: newSession,
        });
    } catch (error) {
        logger.error({ error }, 'Error proposing session via REST:');
        res.status(500).json({
            success: false,
            error: 'Internal server error while proposing session.',
        });
    }
};

/**
 * Allows event organizers to update the status of a proposed session.
 */
export const updateSessionStatus = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const { status, startTime, durationMinutes } = req.body;

        const validStatuses = ['proposed', 'approved', 'rejected', 'scheduled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status provided.',
            });
        }

        const updateData: any = { status };
        if (startTime) updateData.startTime = new Date(startTime);
        if (durationMinutes) updateData.durationMinutes = durationMinutes;

        const updatedSession = await EventSession.findByIdAndUpdate(
            sessionId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                error: 'Session not found.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session status updated successfully.',
            data: updatedSession,
        });
    } catch (error) {
        logger.error({ error }, 'Error updating session status:');
        res.status(500).json({
            success: false,
            error: 'Internal server error while updating session.',
        });
    }
};
