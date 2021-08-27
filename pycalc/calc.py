"""
A calculator based on https://en.wikipedia.org/wiki/Reverse_Polish_notation
"""

from __future__ import print_function


def getPrec(c):
    if c in "+-":
        return 1
    if c in "*/":
        return 2
    if c in "^":
        return 3
    return 0

def getAssoc(c):
    if c in "+-*/":
        return "LEFT"
    if c in "^":
        return "RIGHT"
    return "LEFT"

def getBin(op, a, b):
    if op == '+':
        return a + b
    if op == '-':
        return a - b
    if op == '*':
        return a * b
    if op == '/':
        return a / b
    if op == '^':
        return a ** b
    return 0

# Assume | separates the left from the right box
def calc(s):
    numStk = []
    opStk = []
    i = 0
    isUnary = True
    while (i < len(s)):
        while (i < len(s) and s[i] == ' '):
            i += 1
        if (i >= len(s)):
            break
        if (s[i].isdigit()):
            num = ''
            while (i < len(s) and (s[i].isdigit() or s[i] == '.')):
                num += s[i]
                i += 1
            numStk.append(float(num))
            isUnary = False
            continue

        if (s[i] in "+-*/^"):
            if isUnary:
                opStk.append('#')
            else:
                while (len(opStk) > 0):
                    if ((getAssoc(s[i]) == "LEFT" and getPrec(s[i]) <= getPrec(opStk[-1])) or 
                        (getAssoc(s[i]) == "RIGHT" and getPrec(s[i]) < getPrec(opStk[-1]))):
                        op = opStk.pop()
                        if op == '#':
                            numStk.append(-numStk.pop())
                        else:
                            b = numStk.pop()
                            a = numStk.pop()
                            numStk.append(getBin(op, a, b))
                        continue
                    break
                opStk.append(s[i])
            isUnary = True
        elif (s[i] == '('):
            opStk.append(s[i])
            isUnary = True
        else:
            while (len(opStk) > 0):
                op = opStk.pop()
                if (op == '('):
                    break
                if op == '#':
                    numStk.append(-numStk.pop())
                else:
                    b = numStk.pop()
                    a = numStk.pop()
                    numStk.append(getBin(op, a, b))
        i += 1

    while (len(opStk) > 0):
        op = opStk.pop()
        if op == '#':
            numStk.append(-numStk.pop())
        else:
            b = numStk.pop()
            a = numStk.pop()
            numStk.append(getBin(op, a, b))

    return numStk.pop()


# when a string with multiple negative numbers is given as input determine if that string should be positive or negative
# and adjust the amount of negtive signs in the string accordingly 
# Input: A string that has a single only whole or decimal number, with all '-' signs to the left of the whole or decimal number
def handleNegatives(s):
    # get the amount of negatives in the string
    amount = s.count('-')

    # get the last position 
    lastNegativeIdx = s.rfind('-')

    # check if this is an even amount of negative signs
    if amount % 2 == 0 :
        # return the string without any negative signs as this is a positive number
        return s[lastNegativeIdx + 1:]
    else:
        # return the string with a single negatvie sign
        return s[lastNegativeIdx:]


def simplecalc(s):
    # find the position of the separator 
    separatorPosition = s.find('|')

    #get the left half of the equation 
    leftHandSide = s[0:separatorPosition]
    print(leftHandSide)

    # determine if a . is in the lefthand side
    leftHandSideIsDecimal = s.find('.') != -1

    #get thr right half of the equation
    rightHandSide = s[separatorPosition+1:]
    print(rightHandSide)

    # determine if right handSide is a decimal
    rightHandSideIsDecimal = s.find('.') != -1


    if leftHandSideIsDecimal or rightHandSideIsDecimal:
        return float(handleNegatives(leftHandSide)) + float(handleNegatives(rightHandSide))
    else: 
        return int(handleNegatives(leftHandSide)) + int(handleNegatives(rightHandSide))


    

# if __name__ == '__main__':
#     ss = [
#         "1 + 2 * 3 / 4 - 5 + - 6", # -8.5
#         "10 + ( - 1 ) ^ 4", # 11
#         "10 + - 1 ^ 4", # 9
#         "10 + - - 1 ^ 4", # 11
#         "10 + - ( - 1 ^ 4 )", # 11
#         "5 * ( 10 - 9 )", # 5
#         "1 + 2 * 3", # 7
#         "4 ^ 3 ^ 2", # 262144
#         "4 ^ - 3", # 0.015625
#         "4 ^ ( - 3 )", # 0.015625
#     ]
#     for s in ss:
#         res = calc(s)
#         print('{} = {}'.format(res, s))

if __name__ == '__main__':
    ss = [
        "1|---1",
        "2|--2"
    ]
    for s in ss:
        res = simplecalc(s)
        print(res)
    