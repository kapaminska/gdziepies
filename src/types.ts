import type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './db/database.types';

// ==========================================
// Enum Re-exports
// ==========================================
// Re-exporting enums for easier usage in frontend components and validation
export type AnimalSpecies = Enums<'animal_species'>;
export type AnimalSize = Enums<'animal_size'>;
export type AnimalAgeRange = Enums<'animal_age_range'>;
export type AnnouncementStatus = Enums<'announcement_status'>;
export type AnnouncementType = Enums<'announcement_type'>;

// ==========================================
// Profiles
// ==========================================

/**
 * DTO representing a public user profile.
 * Derived from the 'profiles_public' view to ensure only safe data is exposed.
 */
export type ProfileDto = Tables<'profiles_public'>;

/**
 * DTO representing the logged-in user's full profile.
 * Includes private information like phone_number.
 */
export type MyProfileDto = Tables<'profiles'>;

/**
 * Command to update the current user's profile.
 * - 'id' is omitted as it should be handled via the session.
 * - 'username' is typically immutable or handled via specific logic, but kept optional here if needed.
 * - 'created_at' and 'updated_at' are handled by the database.
 */
export type UpdateProfileCommand = Omit<
  TablesUpdate<'profiles'>,
  'id' | 'created_at' | 'updated_at'
>;

// ==========================================
// Announcements
// ==========================================

/**
 * DTO representing a single announcement.
 * Extends the base table row with the joined 'author' profile information.
 */
export type AnnouncementDto = Tables<'announcements'> & {
  /**
   * The public profile of the user who created the announcement.
   * Retrieved via foreign key relation.
   */
  author: ProfileDto | null;
};

/**
 * Command to create a new announcement.
 * - System fields (id, created_at, updated_at) are omitted.
 * - 'author_id' is omitted as it is injected from the authenticated user session.
 * - 'status' is optional/omitted as it defaults to 'active' on creation.
 */
export type CreateAnnouncementCommand = Omit<
  TablesInsert<'announcements'>,
  'id' | 'created_at' | 'updated_at' | 'author_id' | 'status'
>;

/**
 * Command to update an existing announcement.
 * - System fields are omitted.
 * - 'author_id' is omitted to prevent ownership transfer via update.
 */
export type UpdateAnnouncementCommand = Omit<
  TablesUpdate<'announcements'>,
  'id' | 'created_at' | 'updated_at' | 'author_id'
>;

// ==========================================
// Comments
// ==========================================

/**
 * DTO representing a comment on an announcement.
 * Extends the base table row with the joined 'author' profile information.
 */
export type CommentDto = Tables<'comments'> & {
  /**
   * The public profile of the user who wrote the comment.
   */
  author: ProfileDto | null;
};

/**
 * Command to add a new comment.
 * - System fields are omitted.
 * - 'author_id' is injected from the session.
 */
export type AddCommentCommand = Omit<
  TablesInsert<'comments'>,
  'id' | 'created_at' | 'author_id'
>;

// ==========================================
// Reports
// ==========================================

/**
 * Command to report an announcement.
 * - 'reporting_user_id' is injected from the session.
 */
export type CreateReportCommand = Omit<
  TablesInsert<'reports'>,
  'id' | 'created_at' | 'reporting_user_id'
>;

// ==========================================
// Miscellaneous
// ==========================================

/**
 * Return type for the 'get_contact_details' database function.
 */
export type ContactDetailsResponse = {
  phone_number: string;
};