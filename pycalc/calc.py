from __future__ import print_function
from decimal import Decimal, getcontext

# set the precision to 28 significant digits
getcontext().prec = 28


# when a string with multiple negative numbers is given as input determine if that string should be positive or negative
# and adjust the amount of negtive signs in the string accordingly 
# Input: A string that has a single only whole or decimal number, with all '-' signs to the left of the whole or decimal number
def handleMinusSigns(s):
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

# Assume | separates the two numbers being summed
# Calculates a sum from two numbers represnted as strings
def simplecalc(s):
    # find the position of the separator 
    separatorPosition = s.find('|')

    #get the number to the left of the '|' separator
    leftHandSide = s[0:separatorPosition]
    

    # determine if a '.' is in the value
    leftHandSideIsDecimal = s.find('.') != -1

    #get thr number on the right half of the '|' separator
    rightHandSide = s[separatorPosition+1:]
  

    # determine if the value has a '.'
    rightHandSideIsDecimal = s.find('.') != -1

    # determine if at least one value has a decimal 
    if leftHandSideIsDecimal or rightHandSideIsDecimal:
        # handle the minus signs and then convert the inputs to decimals before finally performing addition 
        value =  Decimal(handleMinusSigns(leftHandSide)) + Decimal(handleMinusSigns(rightHandSide))
        # return the sum as string to get around Nodejs 64bit limits
        return str(value)
    # summing whole numbers    
    else: 
        # handle the minus signs before converting the inputs to integers and adding them 
        value =  int(handleMinusSigns(leftHandSide)) + int(handleMinusSigns(rightHandSide))
        # return the sum as string to get around Nodejs 64bit integer limits
        return str(value)


if __name__ == '__main__':
    ss = [
        "1|---1",
        "2|--2",
        "922337203685472112375807.14|92233728921892198891289",
        "-12.2|12",
        ".1|.1456",
        ".25|24",
        "1.2121|12",
        "1.8e308|1.8e308"
    ]
    for s in ss:
        res = simplecalc(s)
        print(res)
    