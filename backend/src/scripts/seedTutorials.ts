import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tutorial from '../models/Tutorial.js';
import { User } from '../models/User.js';

dotenv.config();

const tutorials = [
  {
    title: "JavaScript Variables",
    description: "Learn about variables in JavaScript including let, const, var, scope, and data types",
    language: "javascript",
    difficulty: "beginner",
    order: 1,
    content: `# JavaScript Variables

Variables are used to store data values. JavaScript uses three keywords to declare variables: \`var\`, \`let\`, and \`const\`.

## Table of Contents
- What is a Variable?
- Variable Declaration
- Variable Assignment
- Variable Scope
- Data Types
- Examples
- Practice Problems

## What is a Variable?

A variable is a named storage location in memory that holds a value. Think of it as a labeled box where you can store and retrieve data.

**Syntax:**
\`\`\`javascript
let variableName = value;
\`\`\`

## Variable Declaration

### 1. Using let (ES6)
\`let\` declares a block-scoped variable that can be reassigned.

\`\`\`javascript
let x = 10;
let name = "John";
let isActive = true;
\`\`\`

### 2. Using const (ES6)
\`const\` declares a block-scoped constant that cannot be reassigned.

\`\`\`javascript
const PI = 3.14159;
const MAX_SIZE = 100;
\`\`\`

### 3. Using var (Legacy)
\`var\` declares a function-scoped or globally-scoped variable. **Not recommended in modern JavaScript.**

\`\`\`javascript
var age = 25;
\`\`\`

## Variable Assignment

### Initial Assignment
\`\`\`javascript
let count = 0;           // Declare and assign
const name = "Alice";    // Declare and assign constant
\`\`\`

### Reassignment
\`\`\`javascript
let score = 10;
score = 20;              // Allowed with let
score = score + 5;       // Now score is 25

const MAX = 100;
// MAX = 200;            // ❌ Error: Cannot reassign const
\`\`\`

## Variable Scope

### Global Scope
Variables declared outside any function or block have global scope.

\`\`\`javascript
let globalVar = "I am global";

function test() {
    console.log(globalVar); // Accessible
}
\`\`\`

### Function Scope
Variables declared inside a function are local to that function.

\`\`\`javascript
function myFunction() {
    let localVar = "I am local";
    console.log(localVar); // Accessible here
}
// console.log(localVar); // ❌ Error: Not accessible outside
\`\`\`

### Block Scope
\`let\` and \`const\` are block-scoped (limited to \`{}\` blocks).

\`\`\`javascript
if (true) {
    let blockVar = "Block scoped";
    console.log(blockVar); // Accessible here
}
// console.log(blockVar); // ❌ Error: Not accessible outside
\`\`\`

## Data Types

JavaScript variables can hold different data types:

### Primitive Types

**String:**
\`\`\`javascript
let firstName = "Ahmed";
let lastName = 'Ali';
let message = \`Hello \${firstName}\`; // Template literal
\`\`\`

**Number:**
\`\`\`javascript
let age = 25;
let price = 99.99;
let negative = -10;
\`\`\`

**Boolean:**
\`\`\`javascript
let isStudent = true;
let hasLicense = false;
\`\`\`

## Examples

### Example 1: Basic Variable Usage
\`\`\`javascript
let name = "Ali";
let age = 20;
let city = "Nablus";

console.log(name);  // Ali
console.log(age);   // 20
console.log(city);  // Nablus
\`\`\`

### Example 2: Variable Reassignment
\`\`\`javascript
let count = 0;
console.log("Initial:", count);  // Initial: 0

count = 5;
console.log("After update:", count);  // After update: 5
\`\`\`

## Practice Problems

### Problem 1: Variable Swap
Swap the values of two variables.

\`\`\`javascript
let a = 5;
let b = 10;

[a, b] = [b, a];

console.log(a); // 10
console.log(b); // 5
\`\`\`

## Key Points to Remember

✅ Use \`const\` by default
✅ Use \`let\` only when you need to reassign
✅ Avoid using \`var\` in modern JavaScript
✅ Variable names should be descriptive
✅ Follow camelCase naming convention

## Summary

Variables are fundamental to JavaScript programming. Use \`let\` for values that change and \`const\` for constants. Always follow naming conventions and understand variable scope to write clean, maintainable code.

**Next Tutorial:** JavaScript Data Types and Operators`
  },
  {
    title: "JavaScript Functions",
    description: "Master JavaScript functions including function declarations, expressions, arrow functions, and callbacks",
    language: "javascript",
    difficulty: "beginner",
    order: 2,
    content: `# JavaScript Functions

Functions are reusable blocks of code that perform specific tasks. They are one of the fundamental building blocks in JavaScript.

## What is a Function?

A function is a set of statements that performs a task or calculates a value. Functions help organize code and make it reusable.

**Basic Syntax:**
\`\`\`javascript
function functionName(parameters) {
    // code to be executed
    return value;
}
\`\`\`

## Function Declaration

\`\`\`javascript
function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("Ali")); // Hello, Ali!
\`\`\`

## Function Expression

\`\`\`javascript
const greet = function(name) {
    return "Hello, " + name + "!";
};

console.log(greet("Sara")); // Hello, Sara!
\`\`\`

## Arrow Functions (ES6)

Arrow functions provide a shorter syntax for writing functions.

\`\`\`javascript
// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

console.log(add(5, 3)); // 8
\`\`\`

### Arrow Function Variations

\`\`\`javascript
// No parameters
const greet = () => "Hello!";

// One parameter (parentheses optional)
const square = x => x * x;

// Multiple parameters
const multiply = (a, b) => a * b;

// Multiple statements (need curly braces and return)
const calculate = (a, b) => {
    const sum = a + b;
    return sum * 2;
};
\`\`\`

## Function Parameters

### Default Parameters
\`\`\`javascript
function greet(name = "Guest") {
    return \`Hello, \${name}!\`;
}

console.log(greet());        // Hello, Guest!
console.log(greet("Ahmed")); // Hello, Ahmed!
\`\`\`

### Rest Parameters
\`\`\`javascript
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4)); // 10
\`\`\`

## Return Statement

Functions can return values using the \`return\` statement.

\`\`\`javascript
function multiply(a, b) {
    return a * b;
}

let result = multiply(5, 3);
console.log(result); // 15
\`\`\`

## Examples

### Example 1: Calculate Area
\`\`\`javascript
function calculateArea(width, height) {
    return width * height;
}

console.log(calculateArea(5, 10)); // 50
\`\`\`

### Example 2: Check Even/Odd
\`\`\`javascript
const isEven = (num) => num % 2 === 0;

console.log(isEven(4));  // true
console.log(isEven(7));  // false
\`\`\`

### Example 3: Find Maximum
\`\`\`javascript
function findMax(arr) {
    return Math.max(...arr);
}

console.log(findMax([1, 5, 3, 9, 2])); // 9
\`\`\`

## Practice Problems

### Problem 1: Celsius to Fahrenheit
\`\`\`javascript
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

console.log(celsiusToFahrenheit(0));   // 32
console.log(celsiusToFahrenheit(100)); // 212
\`\`\`

### Problem 2: Reverse String
\`\`\`javascript
const reverseString = (str) => str.split('').reverse().join('');

console.log(reverseString("hello")); // olleh
\`\`\`

## Key Points

✅ Functions make code reusable
✅ Use arrow functions for shorter syntax
✅ Default parameters provide fallback values
✅ Always return a value when needed
✅ Use descriptive function names

## Summary

Functions are essential for writing organized, reusable code. Master function declarations, expressions, and arrow functions to become proficient in JavaScript.

**Next Tutorial:** JavaScript Arrays and Array Methods`
  },
  {
    title: "Python Variables and Data Types",
    description: "Introduction to Python variables, data types, and type conversion",
    language: "python",
    difficulty: "beginner",
    order: 1,
    content: `# Python Variables and Data Types

Variables in Python are containers for storing data values. Python is dynamically typed, meaning you don't need to declare variable types explicitly.

## Creating Variables

In Python, variables are created the moment you assign a value to them.

\`\`\`python
x = 5
name = "Ali"
is_student = True
\`\`\`

## Variable Naming Rules

1. Must start with a letter or underscore
2. Cannot start with a number
3. Can only contain alphanumeric characters and underscores
4. Case-sensitive (name ≠ Name)
5. Cannot use Python keywords

**Valid Names:**
\`\`\`python
my_var = 10
_private = 20
userName = "John"
age2 = 25
\`\`\`

**Invalid Names:**
\`\`\`python
2name = "Ali"    # Starts with number
my-var = 10      # Contains hyphen
class = "Math"   # Reserved keyword
\`\`\`

## Data Types

### 1. Numeric Types

**Integer:**
\`\`\`python
age = 25
count = 100
negative = -50
\`\`\`

**Float:**
\`\`\`python
price = 99.99
pi = 3.14159
temperature = -5.5
\`\`\`

**Complex:**
\`\`\`python
complex_num = 3 + 4j
\`\`\`

### 2. String

\`\`\`python
name = "Ahmed"
message = 'Hello World'
multiline = """This is
a multiline
string"""
\`\`\`

**String Operations:**
\`\`\`python
first_name = "Ali"
last_name = "Hassan"
full_name = first_name + " " + last_name
print(full_name)  # Ali Hassan

# f-strings (Python 3.6+)
age = 20
message = f"My name is {first_name} and I'm {age} years old"
print(message)
\`\`\`

### 3. Boolean

\`\`\`python
is_active = True
has_permission = False
result = (5 > 3)  # True
\`\`\`

### 4. List

Lists are ordered, mutable collections.

\`\`\`python
fruits = ["apple", "banana", "orange"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "two", True, 3.14]

# Accessing elements
print(fruits[0])  # apple
print(numbers[-1])  # 5 (last element)
\`\`\`

### 5. Tuple

Tuples are ordered, immutable collections.

\`\`\`python
coordinates = (10, 20)
colors = ("red", "green", "blue")

# Accessing elements
print(coordinates[0])  # 10
\`\`\`

### 6. Dictionary

Dictionaries store key-value pairs.

\`\`\`python
person = {
    "name": "Sara",
    "age": 22,
    "city": "Ramallah"
}

print(person["name"])  # Sara
print(person.get("age"))  # 22
\`\`\`

### 7. Set

Sets are unordered collections of unique elements.

\`\`\`python
numbers = {1, 2, 3, 4, 5}
unique_letters = set("hello")  # {'h', 'e', 'l', 'o'}
\`\`\`

## Type Checking

\`\`\`python
x = 5
print(type(x))  # <class 'int'>

name = "Ali"
print(type(name))  # <class 'str'>

is_active = True
print(type(is_active))  # <class 'bool'>
\`\`\`

## Type Conversion

\`\`\`python
# String to Integer
age_str = "25"
age_int = int(age_str)
print(age_int + 5)  # 30

# Integer to String
num = 100
num_str = str(num)
print("The number is: " + num_str)

# String to Float
price_str = "99.99"
price_float = float(price_str)
print(price_float)  # 99.99
\`\`\`

## Multiple Assignment

\`\`\`python
# Assign same value to multiple variables
x = y = z = 0

# Assign different values
a, b, c = 1, 2, 3
print(a, b, c)  # 1 2 3

# Swap variables
x, y = 10, 20
x, y = y, x
print(x, y)  # 20 10
\`\`\`

## Examples

### Example 1: Basic Variables
\`\`\`python
name = "Ahmed"
age = 20
height = 1.75
is_student = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}m")
print(f"Student: {is_student}")
\`\`\`

### Example 2: List Operations
\`\`\`python
numbers = [1, 2, 3, 4, 5]
print(f"Sum: {sum(numbers)}")
print(f"Max: {max(numbers)}")
print(f"Length: {len(numbers)}")
\`\`\`

### Example 3: Dictionary
\`\`\`python
student = {
    "name": "Sara",
    "age": 19,
    "grades": [85, 90, 92]
}

print(f"Student: {student['name']}")
print(f"Average: {sum(student['grades']) / len(student['grades'])}")
\`\`\`

## Practice Problems

### Problem 1: Calculate BMI
\`\`\`python
weight = 70  # kg
height = 1.75  # meters

bmi = weight / (height ** 2)
print(f"BMI: {bmi:.2f}")
\`\`\`

### Problem 2: String Manipulation
\`\`\`python
text = "Python Programming"
print(text.upper())  # PYTHON PROGRAMMING
print(text.lower())  # python programming
print(text.split())  # ['Python', 'Programming']
\`\`\`

## Key Points

✅ Python is dynamically typed
✅ Use snake_case for variable names
✅ f-strings are the modern way to format strings
✅ Lists are mutable, tuples are immutable
✅ Use type() to check variable types

## Summary

Python variables are easy to create and use. Understanding data types is crucial for effective Python programming. Practice working with different types to build strong foundations.

**Next Tutorial:** Python Operators and Expressions`
  },
  {
    title: "Java Variables and Data Types",
    description: "Learn about Java variables, primitive data types, and type casting",
    language: "java",
    difficulty: "beginner",
    order: 1,
    content: `# Java Variables and Data Types

In Java, variables must be declared with a specific data type before they can be used. Java is a strongly-typed language.

## Variable Declaration

**Syntax:**
\`\`\`java
dataType variableName = value;
\`\`\`

**Example:**
\`\`\`java
int age = 25;
String name = "Ahmed";
double price = 99.99;
boolean isActive = true;
\`\`\`

## Primitive Data Types

### 1. Integer Types

**byte** (8-bit):
\`\`\`java
byte smallNumber = 127;  // Range: -128 to 127
\`\`\`

**short** (16-bit):
\`\`\`java
short mediumNumber = 32000;  // Range: -32,768 to 32,767
\`\`\`

**int** (32-bit):
\`\`\`java
int number = 100000;  // Range: -2^31 to 2^31-1
\`\`\`

**long** (64-bit):
\`\`\`java
long bigNumber = 9876543210L;  // Range: -2^63 to 2^63-1
// Note: L suffix for long literals
\`\`\`

### 2. Floating-Point Types

**float** (32-bit):
\`\`\`java
float price = 19.99f;  // Note: f suffix for float
\`\`\`

**double** (64-bit):
\`\`\`java
double pi = 3.14159265359;  // Default for decimals
\`\`\`

### 3. Character Type

\`\`\`java
char grade = 'A';
char symbol = '@';
\`\`\`

### 4. Boolean Type

\`\`\`java
boolean isStudent = true;
boolean hasLicense = false;
\`\`\`

## Reference Types

### String

\`\`\`java
String firstName = "Ali";
String lastName = "Hassan";
String fullName = firstName + " " + lastName;

// String methods
System.out.println(fullName.length());
System.out.println(fullName.toUpperCase());
System.out.println(fullName.toLowerCase());
\`\`\`

### Arrays

\`\`\`java
// Array declaration and initialization
int[] numbers = {1, 2, 3, 4, 5};
String[] fruits = new String[3];
fruits[0] = "Apple";
fruits[1] = "Banana";
fruits[2] = "Orange";

// Accessing elements
System.out.println(numbers[0]);  // 1
System.out.println(fruits[1]);   // Banana
\`\`\`

## Variable Naming Conventions

1. Must start with letter, underscore, or dollar sign
2. Case-sensitive
3. Use camelCase for variables
4. Use UPPER_CASE for constants
5. Cannot use Java keywords

**Examples:**
\`\`\`java
int myAge = 25;              // camelCase
final double PI = 3.14159;   // constant
String userName = "ahmed";
int _private = 10;
\`\`\`

## Type Casting

### Widening (Automatic)
\`\`\`java
int myInt = 9;
double myDouble = myInt;  // Automatic casting: int to double
System.out.println(myDouble);  // 9.0
\`\`\`

### Narrowing (Manual)
\`\`\`java
double myDouble = 9.78;
int myInt = (int) myDouble;  // Manual casting: double to int
System.out.println(myInt);  // 9
\`\`\`

## Constants

Use \`final\` keyword to declare constants.

\`\`\`java
final double PI = 3.14159;
final int MAX_STUDENTS = 30;

// PI = 3.14;  // Error: cannot reassign
\`\`\`

## Examples

### Example 1: Basic Variables
\`\`\`java
public class Main {
    public static void main(String[] args) {
        String name = "Ahmed";
        int age = 20;
        double height = 1.75;
        boolean isStudent = true;
        
        System.out.println("Name: " + name);
        System.out.println("Age: " + age);
        System.out.println("Height: " + height + "m");
        System.out.println("Student: " + isStudent);
    }
}
\`\`\`

### Example 2: Type Casting
\`\`\`java
public class Main {
    public static void main(String[] args) {
        int num1 = 10;
        int num2 = 3;
        
        double result = (double) num1 / num2;
        System.out.println(result);  // 3.3333333333333335
    }
}
\`\`\`

### Example 3: Arrays
\`\`\`java
public class Main {
    public static void main(String[] args) {
        int[] scores = {85, 90, 78, 92, 88};
        
        int sum = 0;
        for (int score : scores) {
            sum += score;
        }
        
        double average = (double) sum / scores.length;
        System.out.println("Average: " + average);
    }
}
\`\`\`

## Practice Problems

### Problem 1: Calculate Area
\`\`\`java
public class Main {
    public static void main(String[] args) {
        double length = 5.5;
        double width = 3.2;
        double area = length * width;
        
        System.out.println("Area: " + area);
    }
}
\`\`\`

### Problem 2: Temperature Conversion
\`\`\`java
public class Main {
    public static void main(String[] args) {
        double celsius = 25.0;
        double fahrenheit = (celsius * 9/5) + 32;
        
        System.out.println(celsius + "°C = " + fahrenheit + "°F");
    }
}
\`\`\`

## Key Points

✅ Java is strongly-typed
✅ Variables must be declared with types
✅ Use appropriate data types for memory efficiency
✅ Constants use \`final\` keyword
✅ Type casting converts between types

## Summary

Understanding Java variables and data types is fundamental to Java programming. Choose the right data type for your needs and follow naming conventions for clean code.

**Next Tutorial:** Java Operators and Control Flow`
  }
];

async function seedTutorials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nexusquest');
    console.log('Connected to MongoDB');

    // Find a teacher user or create a default one
    let teacher = await User.findOne({ role: 'teacher' });
    
    if (!teacher) {
      console.log('No teacher found. Please create a teacher account first.');
      console.log('Run: npm run seed-admin');
      process.exit(1);
    }

    console.log(`Using teacher: ${teacher.name} (${teacher.email})`);

    // Clear existing tutorials (optional)
    // await Tutorial.deleteMany({});
    // console.log('Cleared existing tutorials');

    // Insert tutorials
    for (const tutorialData of tutorials) {
      const existingTutorial = await Tutorial.findOne({ 
        title: tutorialData.title,
        language: tutorialData.language 
      });

      if (existingTutorial) {
        console.log(`Tutorial "${tutorialData.title}" already exists, skipping...`);
        continue;
      }

      await Tutorial.create({
        ...tutorialData,
        createdBy: teacher._id,
        isPublished: true
      });

      console.log(`✅ Created tutorial: ${tutorialData.title}`);
    }

    console.log('\n🎉 Successfully seeded tutorials!');
    console.log(`Total tutorials created: ${tutorials.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tutorials:', error);
    process.exit(1);
  }
}

seedTutorials();
