export interface TutorialSection {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  language?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  sections: TutorialSection[];
  nextTutorialId?: string; // ID of the next tutorial to take
}

export const defaultTutorials: Tutorial[] = [
  // JavaScript Variables
  {
    id: 'js-variables',
    title: "JavaScript Variables",
    description: "Learn about variables in JavaScript including let, const, var, scope, and data types",
    language: "javascript",
    difficulty: "beginner",
    order: 1,
    nextTutorialId: 'js-functions',
    sections: [
      {
        id: 'intro',
        title: "What is a Variable?",
        content: `A variable is a named storage location in memory that holds a value. Think of it as a labeled box where you can store and retrieve data.

Variables are fundamental to programming - they allow you to store information that can be used and changed throughout your program.`,
        codeExample: `let variableName = value;`,
        language: 'javascript'
      },
      {
        id: 'declaration',
        title: "Variable Declaration",
        content: `JavaScript uses three keywords to declare variables: let, const, and var.

**Using let (ES6)** - declares a block-scoped variable that can be reassigned
**Using const (ES6)** - declares a block-scoped constant that cannot be reassigned  
**Using var (Legacy)** - declares a function-scoped variable (not recommended)`,
        codeExample: `// Using let
let x = 10;
let name = "John";
let isActive = true;

// Using const
const PI = 3.14159;
const MAX_SIZE = 100;

// Using var (old way)
var age = 25;`,
        language: 'javascript'
      },
      {
        id: 'assignment',
        title: "Variable Assignment",
        content: `You can assign values to variables when you declare them, or later in your code.

With let, you can reassign values.
With const, you cannot reassign after initial assignment.`,
        codeExample: `let score = 10;
score = 20;              // ✅ Allowed with let
score = score + 5;       // Now score is 25

const MAX = 100;
// MAX = 200;            // ❌ Error: Cannot reassign const`,
        language: 'javascript'
      },
      {
        id: 'scope',
        title: "Variable Scope",
        content: `Scope determines where variables are accessible in your code.

**Global Scope** - accessible everywhere
**Function Scope** - accessible only inside the function
**Block Scope** - accessible only inside the block {}`,
        codeExample: `// Global scope
let globalVar = "I am global";

function test() {
    // Function scope
    let localVar = "I am local";
    console.log(globalVar); // ✅ Accessible
}

if (true) {
    // Block scope
    let blockVar = "Block scoped";
    console.log(blockVar); // ✅ Accessible here
}
// console.log(blockVar); // ❌ Not accessible outside`,
        language: 'javascript'
      },
      {
        id: 'datatypes',
        title: "Data Types",
        content: `JavaScript variables can hold different types of data:

**String** - text data
**Number** - numeric data (integers and decimals)
**Boolean** - true or false values`,
        codeExample: `// String
let firstName = "Ahmed";
let message = \`Hello \${firstName}\`;

// Number
let age = 25;
let price = 99.99;

// Boolean
let isStudent = true;
let hasLicense = false;`,
        language: 'javascript'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `Try this exercise to practice what you learned:

**Exercise:** Create variables for a student profile
1. Create a constant for the student's name
2. Create a variable for their age
3. Create a variable for their GPA
4. Print all information using template literals`,
        codeExample: `// Your solution here:
const studentName = "Ali";
let studentAge = 20;
let studentGPA = 3.5;

console.log(\`Student: \${studentName}\`);
console.log(\`Age: \${studentAge}\`);
console.log(\`GPA: \${studentGPA}\`);`,
        language: 'javascript'
      }
    ]
  },

  // JavaScript Functions
  {
    id: 'js-functions',
    title: "JavaScript Functions",
    description: "Master JavaScript functions including declarations, expressions, arrow functions, and callbacks",
    language: "javascript",
    difficulty: "beginner",
    order: 2,
    nextTutorialId: 'js-arrays',
    sections: [
      {
        id: 'intro',
        title: "What is a Function?",
        content: `Functions are reusable blocks of code that perform specific tasks. They are one of the fundamental building blocks in JavaScript.

Functions help organize code, make it reusable, and easier to maintain.`,
        codeExample: `function functionName(parameters) {
    // code to be executed
    return value;
}`,
        language: 'javascript'
      },
      {
        id: 'declaration',
        title: "Function Declaration",
        content: `The traditional way to create a function in JavaScript is using the function keyword.

Function declarations are hoisted, meaning they can be called before they are defined in the code.`,
        codeExample: `function greet(name) {
    return "Hello, " + name + "!";
}

console.log(greet("Ali")); // Hello, Ali!

function add(a, b) {
    return a + b;
}

console.log(add(5, 3)); // 8`,
        language: 'javascript'
      },
      {
        id: 'arrow',
        title: "Arrow Functions",
        content: `Arrow functions provide a shorter syntax for writing functions. They were introduced in ES6.

Arrow functions are especially useful for short, simple functions.`,
        codeExample: `// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// No parameters
const greet = () => "Hello!";

// One parameter (parentheses optional)
const square = x => x * x;

// Multiple statements
const calculate = (a, b) => {
    const sum = a + b;
    return sum * 2;
};`,
        language: 'javascript'
      },
      {
        id: 'parameters',
        title: "Function Parameters",
        content: `Functions can accept parameters (inputs) and return values (outputs).

You can also set default values for parameters.`,
        codeExample: `// Default parameters
function greet(name = "Guest") {
    return \`Hello, \${name}!\`;
}

console.log(greet());        // Hello, Guest!
console.log(greet("Ahmed")); // Hello, Ahmed!

// Rest parameters
function sum(...numbers) {
    return numbers.reduce((total, num) => total + num, 0);
}

console.log(sum(1, 2, 3, 4)); // 10`,
        language: 'javascript'
      },
      {
        id: 'return',
        title: "Return Statement",
        content: `Functions can return values using the return statement. The return statement stops the execution of a function and sends a value back to the caller.`,
        codeExample: `function multiply(a, b) {
    return a * b;
}

let result = multiply(5, 3);
console.log(result); // 15

function isEven(num) {
    return num % 2 === 0;
}

console.log(isEven(4));  // true
console.log(isEven(7));  // false`,
        language: 'javascript'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Create a function to calculate the area of a rectangle

1. Create a function called calculateArea
2. It should accept width and height as parameters
3. Return the calculated area
4. Test it with different values`,
        codeExample: `// Your solution here:
function calculateArea(width, height) {
    return width * height;
}

console.log(calculateArea(5, 10)); // 50
console.log(calculateArea(3, 7));  // 21

// Bonus: Use arrow function
const calcArea = (w, h) => w * h;
console.log(calcArea(4, 6)); // 24`,
        language: 'javascript'
      }
    ]
  },

  // JavaScript Arrays
  {
    id: 'js-arrays',
    title: "JavaScript Arrays",
    description: "Complete guide to JavaScript arrays including creation, manipulation, and array methods",
    language: "javascript",
    difficulty: "beginner",
    order: 3,
    sections: [
      {
        id: 'intro',
        title: "What is an Array?",
        content: `Arrays are used to store multiple values in a single variable. They are one of the most commonly used data structures in JavaScript.

Arrays can hold values of any type, and you can mix different types in the same array.`,
        codeExample: `// Array literal
let fruits = ["apple", "banana", "orange"];

// Array constructor
let numbers = new Array(1, 2, 3, 4, 5);

// Empty array
let empty = [];`,
        language: 'javascript'
      },
      {
        id: 'access',
        title: "Accessing Elements",
        content: `Arrays use zero-based indexing, meaning the first element is at index 0.

You can access elements using square brackets with the index number.`,
        codeExample: `let fruits = ["apple", "banana", "orange"];

console.log(fruits[0]);  // apple
console.log(fruits[1]);  // banana
console.log(fruits[2]);  // orange

// Last element
console.log(fruits[fruits.length - 1]);  // orange

// Negative indexing (ES2022)
console.log(fruits.at(-1));  // orange`,
        language: 'javascript'
      },
      {
        id: 'methods',
        title: "Array Methods",
        content: `JavaScript provides many built-in methods to manipulate arrays.

The most common methods are push, pop, shift, and unshift for adding/removing elements.`,
        codeExample: `let fruits = ["apple", "banana"];

// Add to end
fruits.push("orange");
console.log(fruits);  // ["apple", "banana", "orange"]

// Remove from end
let last = fruits.pop();
console.log(last);    // orange

// Add to beginning
fruits.unshift("mango");
console.log(fruits);  // ["mango", "apple", "banana"]

// Remove from beginning
let first = fruits.shift();
console.log(first);   // mango`,
        language: 'javascript'
      },
      {
        id: 'iteration',
        title: "Array Iteration",
        content: `You can loop through arrays using several methods: forEach, map, filter, and for loops.

These methods make it easy to process each element in an array.`,
        codeExample: `let numbers = [1, 2, 3, 4, 5];

// forEach - execute function for each element
numbers.forEach((num) => {
    console.log(num * 2);
});

// map - creates new array
let doubled = numbers.map((num) => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// filter - creates new array with elements that pass test
let evens = numbers.filter((num) => num % 2 === 0);
console.log(evens);  // [2, 4]`,
        language: 'javascript'
      },
      {
        id: 'advanced',
        title: "Advanced Methods",
        content: `JavaScript arrays have powerful methods like reduce for transforming arrays into single values.

The reduce method is particularly useful for calculating sums, averages, and other aggregate values.`,
        codeExample: `let numbers = [1, 2, 3, 4, 5];

// reduce - reduces array to single value
let sum = numbers.reduce((total, num) => total + num, 0);
console.log(sum);  // 15

// find - returns first element that matches
let found = numbers.find((num) => num > 3);
console.log(found);  // 4

// sort
let unsorted = [3, 1, 4, 1, 5, 9, 2];
unsorted.sort((a, b) => a - b);
console.log(unsorted);  // [1, 1, 2, 3, 4, 5, 9]`,
        language: 'javascript'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Work with an array of student scores

1. Create an array of test scores
2. Calculate the average score using reduce
3. Filter to find scores above 80
4. Find the highest score`,
        codeExample: `// Your solution here:
let scores = [85, 90, 78, 92, 88, 75];

// Average
let average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
console.log("Average:", average);

// Scores above 80
let highScores = scores.filter(score => score > 80);
console.log("High scores:", highScores);

// Highest score
let max = Math.max(...scores);
console.log("Highest:", max);`,
        language: 'javascript'
      }
    ]
  },

  // Python Variables
  {
    id: 'python-variables',
    title: "Python Variables and Data Types",
    description: "Introduction to Python variables, data types, and type conversion",
    language: "python",
    difficulty: "beginner",
    order: 1,
    nextTutorialId: 'python-functions',
    sections: [
      {
        id: 'intro',
        title: "What are Variables?",
        content: `Variables in Python are containers for storing data values. Python is dynamically typed, meaning you don't need to declare variable types explicitly.

Variables are created the moment you assign a value to them.`,
        codeExample: `x = 5
name = "Ali"
is_student = True`,
        language: 'python'
      },
      {
        id: 'naming',
        title: "Variable Naming Rules",
        content: `Python has specific rules for naming variables:

1. Must start with a letter or underscore
2. Cannot start with a number
3. Can only contain alphanumeric characters and underscores (A-z, 0-9, _)
4. Case-sensitive (name ≠ Name)
5. Cannot use Python keywords`,
        codeExample: `# Valid names
my_var = 10
_private = 20
userName = "John"
age2 = 25

# Invalid names (will cause errors)
# 2age = 25      # Cannot start with number
# my-var = 10    # Cannot use hyphens
# class = "A"    # Cannot use keywords`,
        language: 'python'
      },
      {
        id: 'datatypes',
        title: "Data Types",
        content: `Python has several built-in data types:

**Numeric** - int, float, complex
**String** - text data
**Boolean** - True or False
**List** - ordered, mutable collection
**Tuple** - ordered, immutable collection
**Dictionary** - key-value pairs`,
        codeExample: `# Integer
age = 25

# Float
price = 99.99

# String
name = "Ahmed"

# Boolean
is_active = True

# List
fruits = ["apple", "banana", "orange"]

# Dictionary
person = {"name": "Sara", "age": 22}`,
        language: 'python'
      },
      {
        id: 'strings',
        title: "Working with Strings",
        content: `Strings in Python are sequences of characters. You can use single or double quotes.

f-strings (formatted strings) are the modern way to format text in Python.`,
        codeExample: `name = "Ahmed"
age = 20

# String concatenation
message = "Hello, " + name

# f-strings (recommended)
message = f"My name is {name} and I'm {age} years old"
print(message)

# Multiline strings
text = """This is
a multiline
string"""`,
        language: 'python'
      },
      {
        id: 'conversion',
        title: "Type Conversion",
        content: `You can convert between different data types using type conversion functions.

Common conversion functions: int(), float(), str(), bool()`,
        codeExample: `# String to Integer
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
print(price_float)  # 99.99`,
        language: 'python'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Create a personal information program

1. Create variables for name, age, height
2. Use f-strings to display the information
3. Calculate BMI if given weight and height
4. Convert types as needed`,
        codeExample: `# Your solution here:
name = "Ali"
age = 20
height = 1.75  # meters
weight = 70    # kg

# Display information
print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}m")

# Calculate BMI
bmi = weight / (height ** 2)
print(f"BMI: {bmi:.2f}")`,
        language: 'python'
      }
    ]
  },

  // Python Functions
  {
    id: 'python-functions',
    title: "Python Functions",
    description: "Learn about Python functions, parameters, return values, and lambda functions",
    language: "python",
    difficulty: "beginner",
    order: 2,
    sections: [
      {
        id: 'intro',
        title: "What are Functions?",
        content: `Functions are reusable blocks of code that perform specific tasks. They help organize code and make it more maintainable.

In Python, functions are defined using the def keyword.`,
        codeExample: `def function_name(parameters):
    """Docstring describing the function"""
    # function body
    return value`,
        language: 'python'
      },
      {
        id: 'basic',
        title: "Creating Functions",
        content: `To create a function in Python:
1. Use the def keyword
2. Give it a name
3. Add parameters in parentheses
4. Write the function body (indented)
5. Optionally return a value`,
        codeExample: `def greet(name):
    return f"Hello, {name}!"

print(greet("Ali"))  # Hello, Ali!

def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8`,
        language: 'python'
      },
      {
        id: 'parameters',
        title: "Function Parameters",
        content: `Python functions support several types of parameters:

**Default parameters** - provide default values
**Keyword arguments** - specify arguments by name
***args** - accept variable number of arguments
****kwargs** - accept variable number of keyword arguments`,
        codeExample: `# Default parameters
def greet(name="Guest"):
    return f"Hello, {name}!"

print(greet())        # Hello, Guest!
print(greet("Ahmed")) # Hello, Ahmed!

# Keyword arguments
def describe(name, age, city):
    return f"{name} is {age} from {city}"

print(describe(name="Ali", city="Nablus", age=20))

# *args
def sum_all(*numbers):
    return sum(numbers)

print(sum_all(1, 2, 3, 4))  # 10`,
        language: 'python'
      },
      {
        id: 'return',
        title: "Return Values",
        content: `Functions can return values using the return statement. You can even return multiple values using tuples.

If no return statement is used, the function returns None.`,
        codeExample: `def multiply(a, b):
    return a * b

result = multiply(5, 3)
print(result)  # 15

# Return multiple values
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

min_val, max_val, total = get_stats([1, 2, 3, 4, 5])
print(f"Min: {min_val}, Max: {max_val}, Total: {total}")`,
        language: 'python'
      },
      {
        id: 'lambda',
        title: "Lambda Functions",
        content: `Lambda functions are small anonymous functions that can have any number of parameters but only one expression.

They are useful for short, simple operations.`,
        codeExample: `# Regular function
def square(x):
    return x ** 2

# Lambda function
square_lambda = lambda x: x ** 2

print(square(5))         # 25
print(square_lambda(5))  # 25

# Lambda with multiple parameters
add = lambda a, b: a + b
print(add(3, 4))  # 7

# Using lambda with map
numbers = [1, 2, 3, 4, 5]
doubled = list(map(lambda x: x * 2, numbers))
print(doubled)  # [2, 4, 6, 8, 10]`,
        language: 'python'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Create a temperature converter

1. Create a function celsius_to_fahrenheit
2. Create a function fahrenheit_to_celsius
3. Test both functions with different values
4. Bonus: Create a lambda function to check if a number is even`,
        codeExample: `# Your solution here:
def celsius_to_fahrenheit(celsius):
    return (celsius * 9/5) + 32

def fahrenheit_to_celsius(fahrenheit):
    return (fahrenheit - 32) * 5/9

print(celsius_to_fahrenheit(25))   # 77.0
print(fahrenheit_to_celsius(77))   # 25.0

# Bonus: Lambda function
is_even = lambda x: x % 2 == 0
print(is_even(4))   # True
print(is_even(7))   # False`,
        language: 'python'
      }
    ]
  },

  // Java Variables
  {
    id: 'java-variables',
    title: "Java Variables and Data Types",
    description: "Learn about Java variables, primitive data types, and type casting",
    language: "java",
    difficulty: "beginner",
    order: 1,
    sections: [
      {
        id: 'intro',
        title: "Introduction to Variables",
        content: `In Java, variables must be declared with a specific data type before they can be used. Java is a strongly-typed language.

This means Java checks variable types at compile time, preventing many errors.`,
        codeExample: `dataType variableName = value;`,
        language: 'java'
      },
      {
        id: 'primitive',
        title: "Primitive Data Types",
        content: `Java has 8 primitive data types:

**Integer Types**: byte, short, int, long
**Floating-Point Types**: float, double
**Character**: char
**Boolean**: boolean`,
        codeExample: `// Integer types
byte smallNumber = 127;       // 8-bit
short mediumNumber = 32000;   // 16-bit
int number = 100000;          // 32-bit
long bigNumber = 9876543210L; // 64-bit

// Floating-point types
float price = 19.99f;  // 32-bit
double pi = 3.14159;   // 64-bit

// Character and Boolean
char grade = 'A';
boolean isStudent = true;`,
        language: 'java'
      },
      {
        id: 'reference',
        title: "Reference Types",
        content: `Reference types include String, Arrays, and Objects.

Strings are the most commonly used reference type in Java.`,
        codeExample: `// String
String firstName = "Ali";
String lastName = "Hassan";
String fullName = firstName + " " + lastName;

// String methods
System.out.println(fullName.length());
System.out.println(fullName.toUpperCase());

// Arrays
int[] numbers = {1, 2, 3, 4, 5};
String[] fruits = new String[3];
fruits[0] = "Apple";
fruits[1] = "Banana";
fruits[2] = "Orange";`,
        language: 'java'
      },
      {
        id: 'casting',
        title: "Type Casting",
        content: `Type casting is converting a value from one data type to another.

**Widening** (automatic) - smaller to larger type
**Narrowing** (manual) - larger to smaller type`,
        codeExample: `// Widening (Automatic)
int myInt = 9;
double myDouble = myInt;
System.out.println(myDouble);  // 9.0

// Narrowing (Manual)
double myDouble2 = 9.78;
int myInt2 = (int) myDouble2;
System.out.println(myInt2);  // 9`,
        language: 'java'
      },
      {
        id: 'constants',
        title: "Constants",
        content: `Constants are variables whose values cannot be changed once assigned.

Use the final keyword to declare constants.`,
        codeExample: `final double PI = 3.14159;
final int MAX_STUDENTS = 30;

// PI = 3.14;  // Error: Cannot reassign final variable`,
        language: 'java'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Create a student record program

1. Declare variables for student name, age, and GPA
2. Calculate if the student passes (GPA >= 2.0)
3. Display all information
4. Use appropriate data types`,
        codeExample: `// Your solution here:
public class Main {
    public static void main(String[] args) {
        String studentName = "Ahmed";
        int studentAge = 20;
        double studentGPA = 3.5;
        
        boolean passes = studentGPA >= 2.0;
        
        System.out.println("Name: " + studentName);
        System.out.println("Age: " + studentAge);
        System.out.println("GPA: " + studentGPA);
        System.out.println("Passes: " + passes);
    }
}`,
        language: 'java'
      }
    ]
  },

  // C++ Basics
  {
    id: 'cpp-basics',
    title: "C++ Basics and Variables",
    description: "Introduction to C++ programming, variables, and data types",
    language: "cpp",
    difficulty: "beginner",
    order: 1,
    sections: [
      {
        id: 'intro',
        title: "Introduction to C++",
        content: `C++ is a powerful general-purpose programming language. It's an extension of C with object-oriented features.

C++ is used for system programming, game development, and performance-critical applications.`,
        codeExample: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
        language: 'cpp'
      },
      {
        id: 'variables',
        title: "Variables and Data Types",
        content: `C++ variables must be declared with a specific type before use.

Common data types include int, double, char, bool, and string.`,
        codeExample: `int age = 25;
double price = 99.99;
char grade = 'A';
bool isActive = true;
string name = "Ahmed";`,
        language: 'cpp'
      },
      {
        id: 'io',
        title: "Input and Output",
        content: `C++ uses cout for output and cin for input.

cout sends data to the console, cin receives data from the user.`,
        codeExample: `#include <iostream>
using namespace std;

int main() {
    string name;
    int age;
    
    cout << "Enter your name: ";
    cin >> name;
    
    cout << "Enter your age: ";
    cin >> age;
    
    cout << "Hello " << name;
    cout << ", you are " << age << " years old" << endl;
    
    return 0;
}`,
        language: 'cpp'
      },
      {
        id: 'arrays',
        title: "Arrays",
        content: `Arrays in C++ store multiple values of the same type.

Arrays have a fixed size that must be specified at declaration.`,
        codeExample: `int numbers[5] = {1, 2, 3, 4, 5};
string fruits[] = {"apple", "banana", "orange"};

cout << numbers[0] << endl;  // 1
cout << fruits[1] << endl;   // banana

// Array size
int size = sizeof(numbers) / sizeof(numbers[0]);
cout << "Array size: " << size << endl;`,
        language: 'cpp'
      },
      {
        id: 'constants',
        title: "Constants",
        content: `Constants are values that cannot be modified after declaration.

Use the const keyword to declare constants.`,
        codeExample: `const double PI = 3.14159;
const int MAX_SIZE = 100;

// PI = 3.14;  // Error: Cannot modify const`,
        language: 'cpp'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Create a simple calculator

1. Declare two integer variables
2. Calculate their sum, difference, product
3. Display the results
4. Use appropriate data types`,
        codeExample: `// Your solution here:
#include <iostream>
using namespace std;

int main() {
    int a = 10, b = 5;
    
    int sum = a + b;
    int diff = a - b;
    int prod = a * b;
    
    cout << "Sum: " << sum << endl;
    cout << "Difference: " << diff << endl;
    cout << "Product: " << prod << endl;
    
    return 0;
}`,
        language: 'cpp'
      }
    ]
  },

  // Go Basics
  {
    id: 'go-basics',
    title: "Go (Golang) Basics",
    description: "Introduction to Go programming language, variables, and basic syntax",
    language: "go",
    difficulty: "beginner",
    order: 1,
    sections: [
      {
        id: 'intro',
        title: "Introduction to Go",
        content: `Go (Golang) is a statically typed, compiled programming language designed at Google.

It's known for simplicity, efficiency, and excellent support for concurrent programming.`,
        codeExample: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
        language: 'go'
      },
      {
        id: 'variables',
        title: "Variable Declaration",
        content: `Go has several ways to declare variables:

**Explicit type** - var name type = value
**Type inference** - var name = value
**Short declaration** - name := value (inside functions only)`,
        codeExample: `// Explicit type
var age int = 25
var name string = "Ahmed"

// Type inference
var price = 99.99
var isActive = true

// Short declaration (most common)
count := 10
message := "Hello"`,
        language: 'go'
      },
      {
        id: 'types',
        title: "Data Types",
        content: `Go's basic types include:

**Numeric**: int, float64, complex128
**String**: string
**Boolean**: bool`,
        codeExample: `var integer int = 42
var floatingPoint float64 = 3.14
var text string = "Go Programming"
var flag bool = true

// Multiple declaration
var (
    name string = "Ali"
    age int = 20
    city string = "Ramallah"
)

// Short form
x, y, z := 1, 2, 3`,
        language: 'go'
      },
      {
        id: 'slices',
        title: "Arrays and Slices",
        content: `Go has arrays (fixed size) and slices (dynamic size).

Slices are more commonly used and more flexible.`,
        codeExample: `// Arrays (Fixed Size)
var numbers [5]int = [5]int{1, 2, 3, 4, 5}
fruits := [3]string{"apple", "banana", "orange"}

// Slices (Dynamic Size)
nums := []int{1, 2, 3, 4, 5}
nums = append(nums, 6)

fmt.Println(nums)  // [1 2 3 4 5 6]`,
        language: 'go'
      },
      {
        id: 'functions',
        title: "Functions",
        content: `Go functions are declared using the func keyword.

Functions can return multiple values, which is a powerful feature of Go.`,
        codeExample: `func add(a int, b int) int {
    return a + b
}

func main() {
    result := add(5, 3)
    fmt.Println(result)  // 8
}

// Multiple return values
func getStats(nums []int) (int, int) {
    min := nums[0]
    max := nums[0]
    
    for _, num := range nums {
        if num < min {
            min = num
        }
        if num > max {
            max = num
        }
    }
    
    return min, max
}`,
        language: 'go'
      },
      {
        id: 'practice',
        title: "Practice Exercise",
        content: `**Exercise:** Create a program to calculate average

1. Create a slice of numbers
2. Write a function to calculate the average
3. Display the result
4. Use appropriate Go syntax`,
        codeExample: `// Your solution here:
package main

import "fmt"

func average(numbers []int) float64 {
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    return float64(sum) / float64(len(numbers))
}

func main() {
    nums := []int{85, 90, 78, 92, 88}
    avg := average(nums)
    fmt.Printf("Average: %.2f\\n", avg)
}`,
        language: 'go'
      }
    ]
  }
];
