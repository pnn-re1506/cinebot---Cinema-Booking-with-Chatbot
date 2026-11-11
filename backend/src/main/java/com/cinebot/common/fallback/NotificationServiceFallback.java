package com.cinebot.common.fallback;

import com.cinebot.notification.application.EmailMessage;
import com.cinebot.notification.application.NotificationService;
import org.springframework.context.annotation.Fallback;
import org.springframework.stereotype.Component;

@Component
@Fallback
public class NotificationServiceFallback implements NotificationService {

    @Override
    public void enqueue(EmailMessage message) {
        throw new UnsupportedOperationException("NotificationService not implemented yet (task B7)");
    }
}
