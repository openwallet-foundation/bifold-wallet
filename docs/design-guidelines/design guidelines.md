# Design Guidelines
This document is an adaptable set of reccomendations that follow standard design principles that help to ensure a positive user experience. These guideslines are based off of the following existing design systems:
- Material Design
- B.C. government web standards and guides

## Content Design

### Audience

Content should be written according to who your audience is. Ensure that it is written in a language that they understand. 

### Plain language
Even if your audience may have a more technical background, writing in plain language will help ensure that anyone reading will understand it.

**Tips:**
- Write at a Grade 8 reading level or lower. There are online tools available to grade your content reading level.
- Choose shorter words over long words with multipe syllables. Example "Obtain" -> "Get"
- Offer an explanation if an obscure word or term must be used
- Use analogies of existing and established mental models to help explain complex concepts, even if the analogy isn't technically accurate.
- Be consistent and use the same words to the describe the same thing


### Simple and concise
Mobile apps don't have the luxury of space. Is it better for digital wallets mobile apps to write content as clearly but simply as possible.

**Tips:**
- Divide content in short paragraphs that focus on one topic. Small segments of information are easier to read and comprehend.
- Write in lists if possible instead of long setences so content is read more easily

### Layout
People skim content. Only show relevant information for the intended user flow (happy path). Be mindful of the horizontal line length. 

**Tips:**
- Use callout boxes to highlight important information
- Hide information in accordions to avoid visual clutter which will help people scan their desired topics and expand the content further
- Ensure the maximum line length is 50-70 character (depending on character style)


### Descriptive call to actions
Avoid button text or link text that do not independently describe what the function does, for example, "View" -> View offer" or "Click here" -> "Learn more about content design"

## Data Formats

### Periods of time

 Type | Guidance | Example 
 --- | --- | --- 
Dates | Write out days of the week, when space is limited abbreviate to the first three letters, with no punctuation | Monday ; Mon
Months | Write out the full name of the month. If the year is already clear you do not need to include it. When space is limited, abbreviate month names by using the first three letters of the month | December ; Dec 31 ; December 31, 2026
Time | Hours without the minute time are written numerically with no zeros or colon. Include a space after the number. Do not use periods or capitalize am or pm. Hours with the minute time have a colon | 9 am ; 9:45 pm ; 14:45
Time of day | Write noon and midnight, not 12 noon or 12 midnight | 
Time zones | Do not include the time zone unless you're providing information on multiple time zones. Capitalize Pacific, Atlantic and Newfoundland when the time zone is written out, but not mountain, central and eastern. Time zones are abbreviated and capitalized when included as part of a clock time. Use Pacific time rather than Pacific standard time (PST) or Pacific daylight time (PDT) if including the time zone. PST is observed from early November to mid-March. PDT is observed from mid-March to early November.| Pacific time ; mountain standard time ; 9:30 pm AST
Order of periods of time | [month] [day], [year], [time] [time zone] | September 25, 2015, 1:30 pm PST
Duration | Show the duration of time in the format H:MM:SS. Omit hours or seconds if they don’t apply. | 0:45 : 2:45:05

### Timestamp behaviour
If there's an event where communicating when it happened should be relative to the present (ex. a notification or text message), the timestamp format changes depending on how long ago that event happened.

- **Less than a minute** = Just now

- **1 minute - 59 minutes** = display minutes. Round to lowest minute. Ex. 45 minutes and 33 seconds = 45 minutes ago

- **1 hour - 23:59** = display HH:MM timestamp. Ex. 4:23 pm or 16:24

- **24:00 - year** = display month, day and time. Ex. Sep 25, 13:30 

- **Over a year** = display month, day, year and time. Ex. Sep 25, 2015, 1:30 pm

### Phone numbers
Use a hyphen (-) to separate each block of digits in phone numbers:

Ex. 604-660-2421 or 1-800-663-7867

Hyperlink phone numbers so people can call a number by clicking on it.

## Buttons
Buttons let people know what actions they can take. 

### Hierarchy
[insert image of example of button hierarchy]

The importance of a button can be determined by it's level of visibility and placement. Highly visible buttons that are strategically placed will allow people to quickly identify the next call-to-action and help complete their task/goal quicker. This helps reduce cognitive load (the mental effort of a user to process information).

There is no agreement on the placement of primary and secondary buttons ex. "Okay" / "Cancel" versus "Cancel" / "Okay". It is important to be consistent. 

### States
Buttons should also have different states to commmunicate the status of that action they can take. There must always be visual cues beyond just colour to indicate a change in state.

States include: Active/Enabled, Disabled, Hover, Focused, Pressed

Buttons that are in a disabled state should be clear on why it's disabled. If it is not clear, consider enabling the button and displaying an alert to inform people on why the button is disabled. [insert image of an alert when a form is missing a field] 

### Text versus Icon versus both
Text should accompany icons that are not universally recognized. Icons that are well understood or universally recognized may be placed without text. 

### Touch targets
[insert image of touch target of buttons]

Touch targets are areas of a screen that response to user input (touch, voice control, screen readers, etc.). WCAG standards recommends a touch target of 44 by 44 dp, except when:
- The target is available through an equivalent link or control on the same page that is at least 44 by 44 dp
- The target is in a sentence or block of text
- The size of the target is determined by the user agent and is not modified by the author
- A particular presentation of the target is essential to the information being conveyed

To avoid overlapping touch targets, there should be a space of at least 16 dp between horizontally stacked buttons and 16 px between vertically stacked buttons.

## Scrolling
Content should never be hidden or cut off.

If content or elements extend past the screen size, always enable scrolling so that people can interact with the contents. Be mindful of accessibility settings that would increase the font size.

Ensure that content does not get covered by fixed elements on the screen by adding padding at the bottom.


## Progress indicators
Progress indicators indicates help communicate what the system is doing, giving context to users so they constantly know that the system is working and removes uncertainty.

If loading is expected to be long, a way to escape the loading state should always be available. Manage a user's expectations by informing them if progress is expected to be long or if it's taking longer than usual so they may take appropriate steps. 

If a delay is expected to be | 
--- | ---
<1 second | use the pressed/pending state
1-4 seconds |  provide a dedicated visual cue, such as a button with an animated icon, a loading bar, or a skeleton screen
 > 4 seconds | use a loading screen

### Use the correct type of progress indicator
- Determinate progress indicators communicate a known completion rate. Ex. progress bar with a percent complete indicator. 
- Indeterminate progress indicators communicate an unknown completion rate or if the completion rate is not important to communicate. Ex. A spinning wheel

### Use loading times effectively
If a long wait is inevitable, turn it into a positive experience by adding value while people wait.

**Tips**
- Add tips on how to use the app
- Advertise new features
- Describe what people may be expecting after the wait
- Add a quick survey
- Add a delightful animation

## Accessibility
The following is a fraction of reccomendations based off of WCAG standards. Designing with accessibility in mind will allow diverse people to use your app and improves the overall experience for everyone. 

### Accessibility Roles
**Interactive icons or buttons that don't have text** should have:
- accessibility label that convey the purpose of the button
- "button" accessibility role

All **buttons or interactive icons** should have:
- "button" accessibility role

All **links** should have:
- "link" accessibility role

**Tab navigation bar** should have:
- "tab" accessibility role

All **title of a screen, modal, notification** should have:
- "header" accessibility role

### Accessibility States

**Elements with multiple states** should have:
- "togglebutton" / "radio" / "checkbox" / etc. accessibility role
- accessibilityState "checked" / "disabled" / "selected" / etc. to indicate if the element is on or off, disabled, or selected.

### Decorative images
Icons that don't add extra context or meaning are decorative and should have accessibility disabled or hidden to avoid being focused.

### Focus order
As users navigate sequentially using assistive technology, information should be presented in an order that is consistent with the meaning of the content.

Elements should be laid out so that the focus follows the language's written/reading direction (ex. left-to-right or right-to-left) and isn't inconsistent with the meaning of the content.

Group elements together so that assistive technology such as screen readers read grouped elements together

If context changes, the focus should change to the new context that doesn't confuse the user.

For example, when a module paginates to the next page, the following should happen:
- Focus should move from the 'next' button to the Page title.
- If the module was dismissed, the focus should revert back to the element that initiated the module
