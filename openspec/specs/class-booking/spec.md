# class-booking Specification

## Purpose

Lets a member claim a spot in a scheduled class so their place is secured, and
tells them which business rule refused the attempt when it cannot be granted.

## Requirements

### Requirement: Reserving a class with room secures a spot

A member SHALL be able to reserve a class that has at least one open spot and
that they do not already hold.

#### Scenario: A class with room is reserved

- **WHEN** a member activates the reserve action on a class with at least one
  open spot, that they have not reserved, and for whose day they hold fewer
  than two reservations
- **THEN** the reservation is granted

### Requirement: A granted reservation confirms itself to the member

A granted reservation SHALL show the member the message
`Done! Your spot is booked.`

#### Scenario: Confirmation after reserving

- **WHEN** a member's reservation is granted
- **THEN** the message `Done! Your spot is booked.` is shown

### Requirement: A granted reservation increases the class's taken spots by one

A granted reservation SHALL increase by exactly one the number of spots taken in
that class.

#### Scenario: The taken spots go up

- **WHEN** a member reserves a class with a total capacity of `20` and `18`
  spots taken
- **THEN** that class has `19` spots taken

#### Scenario: Other classes are untouched

- **WHEN** a member reserves one class
- **THEN** the spots taken in every other class are unchanged

### Requirement: A granted reservation leaves the total capacity unchanged

A granted reservation SHALL NOT change the class's total capacity. The spots it
offers are the capacity minus the spots taken, so raising the taken count by one
is what leaves one fewer spot on offer — no count of available spots is held
anywhere.

#### Scenario: The offered spots follow the taken count

- **WHEN** a member reserves a class showing `2 of 20 spots`
- **THEN** that class shows `1 of 20 spots`, its capacity still `20`

#### Scenario: Reserving the last spot fills the class

- **WHEN** a member reserves a class showing `1 of 12 spots`
- **THEN** its taken spots equal its capacity, so it is marked `Full` and offers
  no usable reserve action

### Requirement: A granted reservation is recorded against the member

A granted reservation SHALL record the member as a holder of a spot in that
class, so later attempts can tell it apart from a class they have not
reserved.

#### Scenario: The member is recorded

- **WHEN** a member's reservation of a class is granted
- **THEN** that member is held as one of that class's reserved members

#### Scenario: Only the reserving member is recorded

- **WHEN** a member's reservation of a class is granted
- **THEN** no other member is added to or removed from that class's reserved
  members

### Requirement: RN-01 — a class with no spots left cannot be reserved

A class whose taken spots equal its total capacity SHALL NOT be reserved, and
the attempt SHALL be refused with the message `This class is full.`

#### Scenario: Reserving a class with no spots left

- **WHEN** a member attempts to reserve a class whose taken spots equal its
  total capacity
- **THEN** the attempt is refused with the message `This class is full.`

### Requirement: RN-02 — the same class cannot be reserved twice

A class the member already holds a spot in SHALL NOT be reserved again, and the
attempt SHALL be refused with the message `You already booked this class.`

#### Scenario: Reserving an already reserved class

- **WHEN** a member attempts to reserve a class they already hold a spot in
- **THEN** the attempt is refused with the message
  `You already booked this class.`

#### Scenario: A different member is unaffected

- **WHEN** a member attempts to reserve a class that another member already
  holds a spot in, and that still has room
- **THEN** the reservation is granted

### Requirement: RN-03 — at most two reservations per class day

A member holding two reservations on a given class day SHALL NOT reserve a
third class on that same day, and the attempt SHALL be refused with the message
`You can only book 2 classes per day.`

#### Scenario: Reserving a third class on the same day

- **WHEN** a member holding two reservations among the classes of a given day
  attempts to reserve a third class on that day
- **THEN** the attempt is refused with the message
  `You can only book 2 classes per day.`

#### Scenario: The second reservation of a day is granted

- **WHEN** a member holding one reservation among the classes of a given day
  attempts to reserve a second class on that day
- **THEN** the reservation is granted

### Requirement: The daily limit counts only the day of the requested class

The two-reservation limit SHALL be counted over the member's reservations among
the classes of the same day as the class being reserved, and SHALL ignore their
reservations on any other day.

#### Scenario: A full day does not block another day

- **WHEN** a member holding two reservations among today's classes attempts to
  reserve a class scheduled for tomorrow, and holds no reservation among
  tomorrow's classes
- **THEN** the reservation is granted

#### Scenario: Each day carries its own limit

- **WHEN** a member has reserved two of today's classes and two of tomorrow's
  classes
- **THEN** both pairs of reservations are held, and only a third class on one
  of those days is refused

### Requirement: The refusal reasons are reported in a fixed order

When more than one business rule refuses the same attempt, the member SHALL be
shown the message of RN-02 before RN-01, and of RN-01 before RN-03, so that the
most specific reason is the one reported.

#### Scenario: Already reserved and full

- **WHEN** a member attempts to reserve a class they already hold a spot in and
  which has no spots left
- **THEN** the message shown is `You already booked this class.`

#### Scenario: Full and at the daily limit

- **WHEN** a member holding two reservations on a day attempts to reserve a
  class on that day which has no spots left
- **THEN** the message shown is `This class is full.`

### Requirement: A refused reservation changes nothing

A refused reservation SHALL leave the class's taken spots and its reserved
members exactly as they were.

#### Scenario: The taken count is untouched after a refusal

- **WHEN** an attempt to reserve a class is refused by any business rule
- **THEN** that class's taken spots are unchanged, so it still offers the same
  spots

#### Scenario: Nothing is recorded after a refusal

- **WHEN** an attempt to reserve a class is refused by any business rule
- **THEN** the member is not added to that class's reserved members

#### Scenario: The daily count is untouched after a refusal

- **WHEN** an attempt to reserve a class is refused by any business rule
- **THEN** the number of reservations the member holds on that day is unchanged

### Requirement: A reservation that fails for any other reason is reported

A reservation attempt that neither succeeds nor is refused by a business rule —
including a failure to reach the gym's records — SHALL be refused with the
message `We could not book your spot. Please try again.`

#### Scenario: The request cannot be completed

- **WHEN** a member activates the reserve action and the attempt fails without
  any business rule refusing it
- **THEN** the message `We could not book your spot. Please try again.` is
  shown, and nothing about the class or the member changes

#### Scenario: A class that no longer exists

- **WHEN** a member activates the reserve action on a class that is no longer
  part of the gym's records
- **THEN** the message `We could not book your spot. Please try again.` is
  shown

### Requirement: Every outcome is shown as a banner below the schedule

The outcome of a reservation attempt SHALL be shown as a single banner placed
below the schedule, styled as a success for a granted reservation and as an
error for a refused one.

#### Scenario: A success banner

- **WHEN** a reservation is granted
- **THEN** a banner reading `Done! Your spot is booked.` is shown below the
  schedule, styled as a success

#### Scenario: An error banner

- **WHEN** a reservation is refused
- **THEN** a banner reading the refusing rule's message is shown below the
  schedule, styled as an error

#### Scenario: Only the latest outcome is shown

- **WHEN** a member makes a second reservation attempt while the banner of the
  previous one is still shown
- **THEN** the banner shows the outcome of the second attempt only

#### Scenario: The banner can be dismissed

- **WHEN** the member dismisses the banner
- **THEN** no banner is shown, and the schedule is otherwise unaffected

### Requirement: The banner stops showing on its own

A banner SHALL stop being shown a few seconds after it appears, without the
member acting on it.

#### Scenario: The banner clears itself

- **WHEN** a banner has been shown for a few seconds and the member has not
  dismissed it
- **THEN** it is no longer shown

### Requirement: A reservation in progress cannot be submitted twice

While a reservation attempt is in progress, the reserve action SHALL NOT start a
second attempt.

#### Scenario: Repeated activation during an attempt

- **WHEN** a member activates the reserve action twice in a row before the
  first attempt has resolved
- **THEN** only one reservation attempt is made

### Requirement: Reserving is attributed to the signed-in member

A reservation SHALL be recorded against the member who is signed in on the
device at the moment of the attempt.

#### Scenario: The signed-in member holds the spot

- **WHEN** a signed-in member's reservation is granted
- **THEN** that member, and no other, is recorded as holding the spot

### Requirement: Reservation copy is in English

Every message shown about a reservation SHALL be written in English.

#### Scenario: Outcome messages are in English

- **WHEN** a member sees the outcome of a reservation attempt in any of its
  cases
- **THEN** the confirmation and every refusal message is in English
