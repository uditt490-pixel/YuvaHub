import { Request, Response } from "express";
import { SchedulingService } from "../../services/schedulingService.js";
import { sendSuccess, sendError } from "../../lib/apiResponse.js";

/**
 * Controller for Smart Interview Scheduling & Calendar Integration (#918)
 */
export const getAvailability = async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { startIso, endIso } = req.query;

  try {
    const slots = await SchedulingService.getStudentAvailability(
      studentId as string,
      startIso as string,
      endIso as string
    );

    return sendSuccess(res, {
      studentId,
      availability: slots,
      isLinked: true,
    });
  } catch (error: any) {
    if (error.message && error.message.includes("Student has not linked a calendar")) {
      return res.status(404).json({ error: "Student has not linked a calendar." });
    }
    console.error("Error fetching student availability:", error);
    return sendError(res, "Failed to retrieve student availability.", 500);
  }
};

export const bookInterviewHandler = async (req: Request, res: Response) => {
  const employerId = req.user?.id || req.user?.uid || (req.user as any)?._id || "employer_user";
  const { studentId, slotStart, slotEnd } = req.body;

  if (!studentId || !slotStart || !slotEnd) {
    return res.status(400).json({
      error: "Missing required fields: studentId, slotStart, and slotEnd are required.",
    });
  }

  try {
    const booking = await SchedulingService.bookInterview(
      employerId,
      studentId,
      slotStart,
      slotEnd
    );

    return res.status(201).json({
      success: true,
      hangoutLink: booking.hangoutLink,
      eventId: booking.eventId,
      summary: booking.summary,
      message: "Interview booked successfully. Calendar invites and video link dispatched.",
    });
  } catch (error) {
    console.error("Error booking interview session:", error);
    return sendError(res, "Failed to book interview session.", 500);
  }
};

export const saveCalendarTokenHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id || req.user?.uid || (req.user as any)?._id || "user_anon";
  const { provider, accessToken, refreshToken, expiryDate } = req.body;

  if (!provider || !accessToken || !refreshToken) {
    return res.status(400).json({
      error: "Missing required fields: provider, accessToken, and refreshToken are required.",
    });
  }

  try {
    await SchedulingService.saveCalendarToken({
      userId,
      provider: provider === "outlook" ? "outlook" : "google",
      accessToken,
      refreshToken,
      expiryDate: expiryDate || new Date(Date.now() + 3600 * 1000),
    });

    return sendSuccess(res, {
      message: "Calendar OAuth token connected successfully.",
      provider,
    });
  } catch (error) {
    console.error("Error saving calendar token:", error);
    return sendError(res, "Failed to connect calendar OAuth token.", 500);
  }
};
