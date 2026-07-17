"use client";

import React, { useState, useEffect } from "react";
import styles from "./Scheduler.module.css";

interface SchedulerProps {
  formData: any;
  paymentId: string;
  orderId: string;
  onBookingComplete: (bookingDetails: any) => void;
}

// Generate the next 7 business days (skipping Saturday & Sunday)
function getNextBusinessDays(count: number): Date[] {
  const dates: Date[] = [];
  let current = new Date();
  
  // Start checking from tomorrow
  while (dates.length < count) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // 0 is Sunday, 6 is Saturday
      dates.push(new Date(current));
    }
  }
  return dates;
}

const TIME_SLOTS = [
  "09:30 AM",
  "10:30 AM",
  "11:30 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM"
];

export default function Scheduler({ formData, paymentId, orderId, onBookingComplete }: SchedulerProps) {
  const [availableDays, setAvailableDays] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAvailableDays(getNextBusinessDays(7));
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
    setError("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setError("");
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      setError("Please select both a date and time slot.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const bookingDetails = {
      date: selectedDate.toISOString().split("T")[0],
      time: selectedTime,
      formattedDateTime: `${formatDate(selectedDate)} at ${selectedTime}`
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking",
          paymentId,
          orderId,
          formData,
          bookingDetails
        })
      });

      if (!response.ok) {
        throw new Error("Failed to register calendar slot.");
      }

      onBookingComplete(bookingDetails);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to confirm call booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.successBadge}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Payment Received Successfully ($99)
      </div>

      <h2 className={styles.title}>Schedule Kickoff Call</h2>
      <p className={styles.subtitle}>
        Payment verified. Pick a time for your 30-minute kickoff call. We'll confirm scope, structure, and design preferences, and you'll have your draft website within 48 hours of this call.
      </p>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.bookingGrid}>
        {/* Date Selector */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>1. Select Kickoff Date</h3>
          <div className={styles.dateList}>
            {availableDays.map((date, idx) => {
              const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
              return (
                <button
                  key={idx}
                  onClick={() => handleDateSelect(date)}
                  className={`${styles.dateBtn} ${isSelected ? styles.active : ""}`}
                >
                  <span className={styles.dateDay}>{date.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <span className={styles.dateNum}>{date.getDate()}</span>
                  <span className={styles.dateMonth}>{date.toLocaleDateString("en-US", { month: "short" })}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selector */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            2. Available Times {selectedDate && `for ${formatDate(selectedDate)}`}
          </h3>
          {!selectedDate ? (
            <div className={styles.placeholderState}>
              Select a date on the left to view available times.
            </div>
          ) : (
            <div className={styles.timeGrid}>
              {TIME_SLOTS.map((time, idx) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={idx}
                    onClick={() => handleTimeSelect(time)}
                    className={`${styles.timeBtn} ${isSelected ? styles.active : ""}`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className={styles.summaryPanel}>
          <div className={styles.summaryText}>
            Booking kickoff for <strong>{formatDate(selectedDate)} at {selectedTime}</strong> (30 minutes)
          </div>
          <div className={styles.prefillInfo}>
            Contact details pre-filled: <span>{formData.name} ({formData.email})</span>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!selectedDate || !selectedTime || isSubmitting}
        className={styles.confirmBtn}
      >
        {isSubmitting ? "Securing Slot..." : "Confirm & Schedule Kickoff"}
      </button>

      <p className={styles.timeZoneNote}>
        * Slots display in your local timezone. A Google Calendar invitation and email invoice will be sent upon scheduling.
      </p>
    </div>
  );
}
