package com.vaarta.user.controller;

import com.vaarta.user.entity.Contact;
import com.vaarta.user.repository.ContactRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/contacts")
public class ContactController {

    private final ContactRepository contactRepository;

    public ContactController(ContactRepository contactRepository) {
        this.contactRepository = contactRepository;
    }

    private UUID getCurrentUserId() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userIdStr);
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getContacts() {
        return ResponseEntity.ok(contactRepository.findByUserId(getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<Contact> addContact(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String name = payload.get("name");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Contact contact = new Contact();
        contact.setUserId(getCurrentUserId());
        contact.setContactEmail(email.trim());
        contact.setContactName(name != null ? name.trim() : email.split("@")[0]);
        
        return ResponseEntity.ok(contactRepository.save(contact));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable UUID id) {
        contactRepository.findById(id).ifPresent(contact -> {
            if (contact.getUserId().equals(getCurrentUserId())) {
                contactRepository.delete(contact);
            }
        });
        return ResponseEntity.ok().build();
    }
}
