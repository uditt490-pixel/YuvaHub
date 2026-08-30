import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  fetchApplications,
  updateApplicationTracker,
  deleteApplicationTracker,
} from "../../services/apiClient";

const STATUS_OPTIONS = [
  { value: "interested", label: "Interested" },
  { value: "submitted", label: "Applied" },
  { value: "under_review", label: "Under Review" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "selected", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchApplications(
        statusFilter === "All" ? undefined : statusFilter
      );

      setApplications(result.applications || []);
    } catch (err: any) {
      setError(err.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const upcomingApplications = useMemo(() => {
    const now = Date.now();

    return applications
      .filter((application) => {
        if (!application.deadline) return false;

        const deadline = new Date(application.deadline).getTime();

        return deadline >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() -
          new Date(b.deadline).getTime()
      );
  }, [applications]);

  const handleStatusChange = async (
    applicationId: string,
    status: string
  ) => {
    try {
      setSavingId(applicationId);

      await updateApplicationTracker(applicationId, {
        status,
      });

      setApplications((previous) =>
        previous.map((application) =>
          application._id === applicationId ||
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (err: any) {
      setError(err.message || "Unable to update application.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (applicationId: string) => {
    if (!window.confirm("Remove this application from your tracker?")) {
      return;
    }

    try {
      setSavingId(applicationId);

      await deleteApplicationTracker(applicationId);

      setApplications((previous) =>
        previous.filter(
          (application) =>
            application._id !== applicationId &&
            application.id !== applicationId
        )
      );
    } catch (err: any) {
      setError(err.message || "Unable to remove application.");
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (value: string | Date) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "No deadline";
    }

    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Application Tracker
        </h1>

        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your applications, statuses, notes, and upcoming
          deadlines in one place.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter("All")}
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            statusFilter === "All"
              ? "bg-teal-600 text-white"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          All
        </button>

        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
              statusFilter === status.value
                ? "bg-teal-600 text-white"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Upcoming deadlines */}
      <div className="rounded-2xl border border-zinc-200 bg-surface p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-5 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          <h2 className="text-xl font-semibold">
            Upcoming Deadlines
          </h2>
        </div>

        {upcomingApplications.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No upcoming application deadlines.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingApplications.slice(0, 5).map((application) => (
              <div
                key={application._id || application.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50"
              >
                <div>
                  <p className="font-medium">
                    {application.opportunity?.title ||
                      "Untitled Opportunity"}
                  </p>

                  <p className="text-sm text-zinc-500">
                    {application.opportunity?.organization ||
                      "Unknown organization"}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <p className="font-medium">
                    {formatDate(application.deadline)}
                  </p>
                  <p className="text-zinc-500">
                    Deadline
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Applications */}
      <div className="rounded-2xl border border-zinc-200 bg-surface dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-600" />
            <h2 className="text-xl font-semibold">
              My Applications
            </h2>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-zinc-300" />

            <p className="font-medium">
              No applications found
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Start tracking opportunities you are interested in.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {applications.map((application) => {
              const id = application._id || application.id;

              return (
                <div
                  key={id}
                  className="space-y-4 p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {application.opportunity?.title ||
                          "Untitled Opportunity"}
                      </h3>

                      <p className="text-sm text-zinc-500">
                        {application.opportunity?.organization ||
                          "Unknown organization"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(id)}
                      disabled={savingId === id}
                      className="self-start rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete application"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-400" />

                      <select
                        value={application.status || "interested"}
                        disabled={savingId === id}
                        onChange={(event) =>
                          handleStatusChange(
                            id,
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-zinc-200 bg-surface px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option
                            key={status.value}
                            value={status.value}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {application.deadline && (
                      <span className="text-sm text-zinc-500">
                        Deadline:{" "}
                        {formatDate(application.deadline)}
                      </span>
                    )}
                  </div>

                  {application.notes && (
                    <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-300">
                      {application.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
