# Design Guidelines

This document is an adaptable set of recomendations that follow standard design principles that help to ensure a positive user experience. These guidelines are based off of the following existing design systems:

- Material Design
- B.C. government web standards and guides

## Principles

### Predictable

User flows should be intuitive and consistent. Use existing mental models and standard UI elements. If existing mental models are not sufficient, then ensure that the system is easy to learn. Consistency will help the learning curve.

### Simple

Be clear and concise rather than clever. Strategically place elements to avoid visual clutter and componentize content to reduce cognitive load. Organize the information architecture so that branches focus on a single goal.

### Friendly

Digital wallets can easily lean towards being technical and complex, which can be intimidating to some. Anthropomorphize your system and attribute a friendly personality to better approach and engage users. This can mean writing content in a conversational tone, using light animation to smooth transitions, using brighter colours, rounding edges, etc.

## Layout

Use visual cues to help identify hierarchy. Material Design takes inspiration on how light behaves in the physical world and uses brightness and shadow to communicate hierarchy.

### Anatomy

![Anatomy of a screen](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/4f41ce41fdc10c7e4c88f154e2994358c2f3d5a0/docs/design-guidelines/assets/Layout.png)

The layout of a screen typically has a:

1. app bar
2. body
3. navigation

#### App bar

The app bar is used to communicate where you are and what you can do on the screen. They are typically placed at the bottom or top. They may contain a:

- Screen title
- A way to navigate away
- Additional actions that can be taken for that screen

If people do not always need to navigate away or take action, consider hiding the app bar on scroll.

#### Body

The body is where most people will interact and takes up most of the screen. It contains the main actions or important information. If people need more room to interact with the body, consider hiding other elements of the screen, such as the app bar or navigation.

#### Navigation

Screens should have a way to navigate away from their current screen to a different one. These can be:

- Tab bar
- navigation pane

### Safe Areas

![Safe areas of a screen](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/4f41ce41fdc10c7e4c88f154e2994358c2f3d5a0/docs/design-guidelines/assets/Safe%20area.png)

Ensure there's adequate space between elements to avoid mis-taps. If there isn't enough room to place all elements, consider collapsing items into subtasks.

Avoid placing elements close to the edge of the screen (margin). Some mobile devices have rounded screens or are in a phone case with a thick bezel that makes it hard to tap elements close to a screen's edge.

Be mindful of content within the body that may get covered by a keyboard. The safe area should be moved to align with the keyboard to avoid obscuring important content.

### Responsive design

![Scalable elements](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/4e597988ed125ddd7e3e4b5b29ed60eea39ade87/docs/design-guidelines/assets/Scalable%20elements.png)

Devices come in different sizes and can be used in different orientations. Consider different layouts for different sizes to strategically use space. Be mindful of elements that do not scale well.

With extra space, make use of white space and avoid cramming too much information into a screen to reduce cognitive load.

Containers should have a maximum width to ensure that elements in a container don't lose their relationship with each other if they were spread apart. A maximum width also controls the line length of content, ensuring that the maximum line length is 50-70 characters.

Some elements

## Content Design

### Audience

![Multi-lingual](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/f4162c6207938d17da7e2e6040707eb78a237d1d/docs/design-guidelines/assets/Multi-language.png)

Content should be written according to who your audience is. Ensure that it is written in languages that they understand, and that the UI can accommodate different reading orientations.

### Plain language

Even if your audience may have a more technical background, writing in plain language will help ensure that anyone reading will understand it.

**Tips:**

- Write at a Grade 8 reading level or lower. There are online tools available to grade your content reading level.
- Choose shorter words over long words with multiple syllables. Example "Obtain" -> "Get"
- Offer an explanation if an obscure word or term must be used
- Use analogies of existing and established mental models to help explain complex concepts, even if the analogy isn't technically accurate.
- Be consistent and use the same words to the describe the same thing

### Simple and concise

Mobile apps don't have the luxury of space. Is it better for digital wallets mobile apps to write content as clearly but simply as possible.

**Tips:**

- Divide content into short paragraphs that focus on one topic. Small segments of information are easier to read and comprehend.
- Write in lists if possible, instead of long sentences so content is read more easily

### Layout

![Callouts and accordions](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/f4162c6207938d17da7e2e6040707eb78a237d1d/docs/design-guidelines/assets/Callout%20and%20accordions.png)

People skim content. Only show relevant information for the intended user flow (happy path). Be mindful of the horizontal line length.

**Tips:**

- Use callout boxes to highlight important information
- Hide information in accordions to avoid visual clutter which will help people scan their desired topics and expand the content further
- Ensure the maximum line length is 50-70 characters (depending on character style)

### Descriptive call to actions

![Descriptive buttons and links](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/f4162c6207938d17da7e2e6040707eb78a237d1d/docs/design-guidelines/assets/Descriptive%20buttons.png)

Avoid button text or link text that do not independently describe what the function does, for example, "View" -> View offer" or "Click here" -> "Learn more about content design"

## Data Formats

### Periods of time

| Type                     | Guidance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Example                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Dates                    | Write out days of the week, when space is limited abbreviate to the first three letters, with no punctuation                                                                                                                                                                                                                                                                                                                                                                                                               | Monday ; Mon                                        |
| Months                   | Write out the full name of the month. If the year is already clear, you do not need to include it. When space is limited, abbreviate month names by using the first three letters of the month                                                                                                                                                                                                                                                                                                                             | December ; Dec 31 ; December 31, 2026               |
| Time                     | Hours without the minute time are written numerically with no zeros or colon. Include a space after the number. Do not use periods or capitalize am or pm. Hours with the minute time have a colon                                                                                                                                                                                                                                                                                                                         | 9 am ; 9:45 pm ; 14:45                              |
| Time of day              | Write noon and midnight, not 12 noon or 12 midnight                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Time zones               | Do not include the time zone unless you're providing information on multiple time zones. Capitalize Pacific, Atlantic and Newfoundland when the time zone is written out, but not mountain, central and eastern. Time zones are abbreviated and capitalized when included as part of a clock time. Use Pacific time rather than Pacific standard time (PST) or Pacific daylight time (PDT) if including the time zone. PST is observed from early November to mid-March. PDT is observed from mid-March to early November. | Pacific time ; mountain standard time ; 9:30 pm AST |
| Order of periods of time | [month] [day], [year], [time] [time zone]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | September 25, 2015, 1:30 pm PST                     |
| Duration                 | Show the duration of time in the format H:MM:SS. Omit hours or seconds if they don’t apply.                                                                                                                                                                                                                                                                                                                                                                                                                                | 0:45 : 2:45:05                                      |

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

### Data redaction

Digital wallets contain sensitive personally identifiable information. Consider hiding or partially hiding sensitive information such as PINs, passwords, personal information, etc. to ensure confidentiality and privacy.

Sensitive information should be hidden on default with the option to show the information. Consider partially hiding information to allow people to identify the information without fully revealing it.

## Buttons

Buttons let people know what actions they can take.

### Hierarchy

The importance of a button can be determined by its level of visibility and placement. Highly visible buttons that are strategically placed will allow people to quickly identify the next call-to-action and help complete their task/goal quicker. This helps reduce cognitive load (the mental effort of a user to process information).

![Button hierarchy](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/722a46ceb272abb2062aaf6531c8a712a0031904/docs/design-guidelines/assets/Button%20hierarchy.png)

1. Primary button. The level of importance and what this button does is communicated by its positioning, colour, and lighting (shadows). People instinctively know that this button is the intended flow.
2. Secondary button. Its lack of colour helps detract people from it but the positioning help to indicate that it's a secondary action.
3. It's lack of colour and positioning minimizes its presence but people who are looking for it can still find it.
4. Although a floating action button with a lot of emphasis, it is behind a scrim (shading).

There is no agreement on the placement of primary and secondary buttons ex. "Okay" / "Cancel" versus "Cancel" / "Okay". It is important to be consistent.

### States

Buttons should also have different states to commmunicate the status of that action they can take. There must always be visual cues beyond just colour to indicate a change in state.

States include: Active/Enabled, Disabled, Hover, Focused, Pressed

Buttons that are in a disabled state should be clear on why it's disabled. If it is not clear, consider enabling the button and displaying an alert to inform people on why the button is disabled. [insert image of an alert when a form is missing a field]

### Text versus icon versus both

![Button text](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/722a46ceb272abb2062aaf6531c8a712a0031904/docs/design-guidelines/assets/Icon%20text.png)

Text should accompany icons that are not universally recognized. Icons that are well understood or universally recognized may be placed without text.

### Touch targets

![Touch targets](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/722a46ceb272abb2062aaf6531c8a712a0031904/docs/design-guidelines/assets/Touch%20targets.png)

Touch targets are areas of a screen that response to user input (touch, voice control, screen readers, etc.). WCAG standards recommends a touch target of 44 by 44 dp, except when:

- The target is available through an equivalent link or control on the same page that is at least 44 by 44 dp
- The target is in a sentence or block of text
- The size of the target is determined by the user agent and is not modified by the author
- A particular presentation of the target is essential to the information being conveyed

To avoid overlapping touch targets, there should be a space of at least 16 dp between horizontally stacked buttons and 16 dp between vertically stacked buttons.

## Scrolling

![Padding](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/2b5bd6626ccf57a5c7ac2fc4b28bb54738bf3b37/docs/design-guidelines/assets/Scroll%20padding.png)

Content should never be hidden or cut off.

If content or elements extend past the screen size, always enable scrolling so that people can interact with the contents. Be mindful of factors that would affect the size of content, such as settings changing the font size or language settings (ex. French content is on average 15-20% longer than English).

Ensure that content does not get covered by fixed elements on the screen by adding padding at the bottom.

## Progress indicators

![Progress indicators](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/2b5bd6626ccf57a5c7ac2fc4b28bb54738bf3b37/docs/design-guidelines/assets/Progress%20indicator.png)

Progress indicators help communicate what the system is doing, giving context to users so they constantly know that the system is working and removes uncertainty.

If loading is expected to be long, a way to escape the loading state should always be available. Manage a user's expectations by informing them if progress is expected to be long or if it's taking longer than usual so they may take appropriate steps.

If a delay is expected to be:

| Time interval | recomendation                                                                                               |
| ------------- | ----------------------------------------------------------------------------------------------------------- |
| <1 second     | use the pressed/pending state                                                                               |
| 1-4 seconds   | provide a dedicated visual cue, such as a button with an animated icon, a loading bar, or a skeleton screen |
| > 4 seconds   | use a loading screen                                                                                        |

### Use the correct type of progress indicator

1. Determinate progress indicators communicate a known completion rate. Ex. progress bar with a percent complete indicator.
2. Indeterminate progress indicators communicate an unknown completion rate or if the completion rate is not important to communicate. Ex. A spinning wheel

### Use loading times effectively

![Fun loading screens](https://github.com/knguyenBC/aries-mobile-agent-react-native/blob/2b5bd6626ccf57a5c7ac2fc4b28bb54738bf3b37/docs/design-guidelines/assets/loading%20fun.png)

If a long wait is inevitable, turn it into a positive experience by adding value while people wait.

**Tips**

- Add tips on how to use the app
- Advertise new features
- Describe what people may be expecting after the wait
- Add a quick survey
- Add a delightful animation

## Accessibility

The following is a fraction of recommendations based off of WCAG standards. Designing with accessibility in mind will allow diverse people to use your app and improves the overall experience for everyone.

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

Group elements together so that assistive technology such as screen readers read grouped elements together.

If context changes, the focus should change to the new context that doesn't confuse the user.

For example, when a module paginates to the next page, the following should happen:

- Focus should move from the 'next' button to the Page title.
- If the module was dismissed, the focus should revert to the element that initiated the module
