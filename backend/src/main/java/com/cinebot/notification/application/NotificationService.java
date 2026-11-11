package com.cinebot.notification.application;

/** Enqueues mail; delivery is the outbox job (ARCHITECTURE §8.4). Implemented by task B7. */
public interface NotificationService {

    /** Stores one outbox row. Sending happens after commit, not inside this call. */
    void enqueue(EmailMessage message);
}
