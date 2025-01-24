# Fitness & Diet App  

A comprehensive mobile application designed to promote healthy lifestyles through personalized fitness and diet plans, activity tracking, and social features.
![mainScreens](https://github.com/user-attachments/assets/70483fd2-f724-4d16-b003-3f0e9b28b1cb)

---

## Features  

### Fitness Tracking 
- **Personalized Diet Plans**:  
  - Track daily workouts, calories burned, and progress toward fitness goals.
  - View detailed stats, including distance, time, and intensity for each activity.
  - Users input their name, weight, height, and age to generate diet recommendations.  
  - Options to filter meals by allergies or manually select diets.
 
- **Authentication**:
  - Secure authentication using SuperTokens.

- **Workout Recommendations**:  
  - Tailored to user preferences and categorized into Cardio, Strength Training, HIIT, Core, and Endurance.  
  - Adaptive workout schedules based on user input and fitness goals.  

- **Meal Database**:  
  - Includes videos, ingredients, and instructions.  
  - Categorized by three main diet types, providing two meals per day aligned with workout goals.  

---

### Run Club  

#### Features  
- **Dynamic Design**:  
  - Parallax scrolling with running-themed images (e.g., sunset trail, urban runners).  
  - Blurred overlays with input fields displayed in modals or cards.  

- **Club Creation** (Existing Users Only):  
  - **Club Name**: Required.  
  - **Club Description**: Optional but recommended.  
  - **Club Goals**: Examples:  
    - “Run 10km per week per user.”  
    - “Collectively run 500km this month.”  
  - **Club Logo**: Upload custom logos or choose from default icons (e.g., running shoes, mountains).  
  - **Invite Members**: Automatically generates a unique invite code.  

- **Run Club Home Screen**:  
  - **Leaderboard**:  
    - Displays top performers by metrics like distance run, calories burned, and completed workouts.  
    - Filters: By day, week, month, or all-time.  
  - **Manage Runners** (For Group Leaders):  
    - Invite members via unique code.  
    - Remove users if necessary.  
    - Assign goals:  
      - Example: “Run 50km collectively this month.”  
      - Individual goals: “Each member must run 10km weekly.”  
    - Set run events with location, date, and time.  
  - **Activity Feed**:  
    - Shows individual member updates: Distance run, calories burned, activity level, and date/time.  
    - Interactions: Users can like, comment, or share updates.  
  - **Notifications**:  
    - New goals or milestones achieved:  
      - Example: “The club has reached 500km! 🎉 Great job team!”  

---

### Screenshots:
- **Auth Screens**:
![authScreens](https://github.com/user-attachments/assets/2c9da72e-e8f5-40ac-8651-0819be9319ef)

- **Onboarding Screens**:
![onboarding](https://github.com/user-attachments/assets/9ac0ae7e-8d4e-43ed-9ce4-540b7622f9c8)

- **Profile Screens**:
![profileScreens](https://github.com/user-attachments/assets/1f4c485a-604a-40e7-81c8-20ebba279004)

- **Main Screens**:
![mainScreens](https://github.com/user-attachments/assets/131afb83-6406-4113-acaa-c51ce0d8505d)

- **RunClub Screens**:
![runClub](https://github.com/user-attachments/assets/095c7c43-4a04-4852-86aa-ae3015821a5c)


## Technologies Used  
- **Frameworks & Libraries**:  
  - React Native, Expo Router, Jest, React Query.  

- **APIs**:  
  - Supertokens for authentication.  
  - Stripe for payment processing.  

- **Database**:  
  - PostgreSQL hosted on Railway.  

---
