# class-schedule Specification

## Purpose

Lets a member browse the gym's upcoming class schedule so they can decide which
class to attend, showing for each class when it runs, who teaches it and whether
there is still room to join.

## Requirements

### Requirement: Schedule covers the next three days

The schedule SHALL list the classes scheduled for today, tomorrow and the day
after tomorrow, and no other day.

#### Scenario: Only the next three days are listed

- **WHEN** a member opens the schedule
- **THEN** every class listed takes place on today's date, tomorrow's date or
  the date two days from today

#### Scenario: A class beyond the third day is excluded

- **WHEN** the schedule data contains a class dated more than two days from
  today
- **THEN** that class is not listed

### Requirement: Class dates resolve against the device date

A class's date SHALL be resolved by adding its day offset to the current date
of the device, where offset `0` is today, `1` is tomorrow and `2` is the day
after tomorrow.

#### Scenario: The schedule follows the device date across a day boundary

- **WHEN** the device date advances to the next calendar day and the member
  reopens the schedule
- **THEN** the classes previously shown under tomorrow are shown under today,
  and the classes previously shown under the day after tomorrow are shown under
  tomorrow

### Requirement: Classes are grouped into one section per day

The schedule SHALL present the classes in three sections, one for each of the
three days, labelled `Today`, `Tomorrow` and `Day after tomorrow` in that
order.

#### Scenario: Each class appears under its own day

- **WHEN** the schedule is displayed
- **THEN** a class dated today appears in the `Today` section, a class dated
  tomorrow in the `Tomorrow` section, and a class dated two days from today in
  the `Day after tomorrow` section

#### Scenario: Sections keep their order

- **WHEN** the member scrolls the schedule
- **THEN** the `Today` section is above the `Tomorrow` section, which is above
  the `Day after tomorrow` section

### Requirement: Classes are ordered by date and start time

The schedule SHALL order the classes by date and then by start time, earliest
first.

#### Scenario: Classes on the same day are ordered by start time

- **WHEN** a day holds a class starting at `06:00` and a class starting at
  `18:00`
- **THEN** the `06:00` class is listed before the `18:00` class

### Requirement: Each class shows its identifying details

Each listed class SHALL show its name, its day, its start time and its
instructor.

#### Scenario: A class displays its details

- **WHEN** a class named `Spinning` taught by `Andrés Restrepo` starts at
  `06:00` today
- **THEN** its entry shows the name `Spinning`, the day it belongs to, the
  start time `06:00` and the instructor `Andrés Restrepo`

### Requirement: A class with room shows its remaining capacity

A class with at least one open spot SHALL show how many spots remain out of the
total, in the form `<available> of <total> spots`.

#### Scenario: Remaining spots are shown

- **WHEN** a class has a total capacity of `20` and `18` spots taken
- **THEN** its entry shows `2 of 20 spots`

### Requirement: A full class is marked as full

A class whose taken spots equal its total capacity SHALL be marked `Full`
instead of showing a remaining-capacity count.

#### Scenario: A full class shows the Full marker

- **WHEN** a class has a total capacity of `12` and `12` spots taken
- **THEN** its entry shows `Full` and does not show a remaining-capacity count

### Requirement: A full class cannot be reserved

A class marked as full SHALL NOT offer a usable reserve action.

#### Scenario: Reserving is unavailable on a full class

- **WHEN** a member views a class that is full
- **THEN** its reserve action is shown as unavailable and cannot be activated

#### Scenario: Reserving is available on a class with room

- **WHEN** a member views a class with at least one open spot
- **THEN** its reserve action is shown as available

### Requirement: Classes that already started are excluded

The schedule SHALL exclude any class whose start time is at or before the
current moment.

#### Scenario: A class earlier today is hidden

- **WHEN** the current time is `19:30` and today holds a class starting at
  `18:00`
- **THEN** that class is not listed

#### Scenario: A later class today remains listed

- **WHEN** the current time is `19:30` and today holds a class starting at
  `20:00`
- **THEN** that class is listed

#### Scenario: A class starting exactly now is hidden

- **WHEN** the current time is `18:00` and today holds a class starting at
  `18:00`
- **THEN** that class is not listed

### Requirement: A retrieved schedule is kept on the device

The schedule SHALL be stored on the device when it is retrieved, and SHALL
survive closing and reopening the app.

#### Scenario: The stored schedule is shown on reopen

- **WHEN** a member who retrieved the schedule earlier the same day closes the
  app and reopens it
- **THEN** the schedule is displayed from the stored copy without the member
  waiting for a retrieval

#### Scenario: The stored schedule is refreshed in the background

- **WHEN** the schedule is displayed from the stored copy
- **THEN** a retrieval runs, and the displayed schedule is replaced by its
  result when it arrives

### Requirement: A stored schedule from an earlier day is not shown

A stored schedule retrieved on an earlier calendar day SHALL NOT be displayed,
because its days are relative to the day it was retrieved.

#### Scenario: Stored schedule is stale by a day

- **WHEN** a member reopens the app on a later calendar day than the one on
  which the stored schedule was retrieved
- **THEN** the stored schedule is not displayed, and the screen behaves as if
  nothing were stored until the retrieval completes

### Requirement: The schedule reports that it is loading

The schedule SHALL show a loading indication while the classes are being
retrieved and there is no stored schedule available to display.

#### Scenario: Loading indication on a first retrieval

- **WHEN** the member opens the schedule with nothing stored and the classes
  have not arrived yet
- **THEN** a loading indication is shown in place of the sections

#### Scenario: No loading indication over a stored schedule

- **WHEN** the member opens the schedule with a stored schedule available and a
  retrieval is running
- **THEN** the stored schedule is shown and no loading indication replaces it

### Requirement: The schedule reports a retrieval failure

When the classes cannot be retrieved, the schedule SHALL show an error message
and offer the member a way to retry.

#### Scenario: Retrieval fails with nothing stored

- **WHEN** retrieving the classes fails and no stored schedule is available
- **THEN** an error message is shown with a retry action, and no sections are
  shown

#### Scenario: Retrieval fails over a stored schedule

- **WHEN** retrieving the classes fails while a stored schedule is displayed
- **THEN** the stored schedule stays displayed, and an error message with a
  retry action is shown alongside it

#### Scenario: Retry after a failure

- **WHEN** the member activates the retry action
- **THEN** the classes are retrieved again

### Requirement: A day with no remaining classes shows an empty message

A day section with no classes left to show SHALL remain visible and display an
empty message of its own.

#### Scenario: A day has no remaining classes

- **WHEN** every class of a given day has already started or that day has no
  classes at all
- **THEN** that day's section is still shown, with a message stating it has no
  classes, and the other sections are unaffected

### Requirement: Invalid class records are discarded

A class record missing any of its required details, or holding a detail of an
unexpected type, SHALL NOT be listed.

#### Scenario: An incomplete record is dropped

- **WHEN** the retrieved data holds a class record with a missing name,
  instructor, day offset, start time, duration, total capacity or taken-spots
  value
- **THEN** that record is not listed, and the remaining valid classes are
  listed normally

### Requirement: The schedule is presented in English

Every label, message and marker on the schedule SHALL be written in English.

#### Scenario: Screen copy is in English

- **WHEN** the member views the schedule in any of its states
- **THEN** the section labels, the capacity text, the full marker, the reserve
  action, the loading, error and empty messages are all in English
