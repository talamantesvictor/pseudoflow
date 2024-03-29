// *******************************************
// Tokens
// *******************************************

export type DeclarationToken =         { name: 'DeclarationToken', rule?: RegExp, value?: string };
export type ReadToken =                { name: 'ReadToken', rule?: RegExp, value?: string };
export type PrintToken =               { name: 'PrintToken', rule?: RegExp, value?: string };
export type AssignmentToken =          { name: 'AssignmentToken', rule?: RegExp, value?: string };
export type OpenParenToken =           { name: 'OpenParenToken', rule?: RegExp, value?: string };
export type CloseParenToken =          { name: 'CloseParenToken', rule?: RegExp, value?: string };
export type OpenIfToken =              { name: 'OpenIfToken', rule?: RegExp, value?: string };
export type OpenIfElseToken =          { name: 'OpenIfElseToken', rule?: RegExp, value?: string };
export type CloseIfToken =             { name: 'CloseIfToken', rule?: RegExp, value?: string };
export type OpenSwitchToken =          { name: 'OpenSwitchToken', rule?: RegExp, value?: string };
export type CloseSwitchToken =         { name: 'CloseSwitchToken', rule?: RegExp, value?: string };
export type OpenCaseToken =            { name: 'OpenCaseToken', rule?: RegExp, value?: string };
export type CloseCaseToken =           { name: 'CloseCaseToken', rule?: RegExp, value?: string };
export type OpenRepeatToken =          { name: 'OpenRepeatToken', rule?: RegExp, value?: string };
export type CloseRepeatToken =         { name: 'CloseRepeatToken', rule?: RegExp, value?: string };
export type OpenWhileToken =           { name: 'OpenWhileToken', rule?: RegExp, value?: string };
export type CloseWhileToken =          { name: 'CloseWhileToken', rule?: RegExp, value?: string };
export type OpenDowhileToken =         { name: 'OpenDowhileToken', rule?: RegExp, value?: string };
export type CloseDowhileToken =        { name: 'CloseDowhileToken', rule?: RegExp, value?: string };
export type AdditionToken =            { name: 'AdditionToken', rule?: RegExp, value?: string };
export type SubstractionToken =        { name: 'SubstractionToken', rule?: RegExp, value?: string };
export type MultiplicationToken =      { name: 'MultiplicationToken', rule?: RegExp, value?: string };
export type DivisionToken =            { name: 'DivisionToken', rule?: RegExp, value?: string };
export type ModuleToken =              { name: 'ModuleToken', rule?: RegExp, value?: string };
export type RelationalToken =          { name: 'RelationalToken', rule?: RegExp, value?: string };
export type BooleanToken =             { name: 'BooleanToken', rule?: RegExp, value?: string };
export type StringToken =              { name: 'StringToken', rule?: RegExp, value?: string };
export type NumericToken =             { name: 'NumericToken', rule?: RegExp, value?: string };
export type IdentifierToken =          { name: 'IdentifierToken', rule?: RegExp, value?: string };
export type OtherToken =               { name: 'OtherToken', rule?: RegExp, value?: string };

export type ArithmeticToken = 
   AdditionToken              | 
   SubstractionToken          | 
   MultiplicationToken        | 
   DivisionToken              | 
   ModuleToken;

export type OperatorToken =
   ArithmeticToken            |
   RelationalToken            |
   BooleanToken;

export type Token = 
   DeclarationToken           | 
   PrintToken                 | 
   ReadToken                  | 
   AssignmentToken            | 
   OpenParenToken             | 
   CloseParenToken            | 
   OpenIfToken                | 
   OpenIfElseToken            | 
   CloseIfToken               | 
   OpenSwitchToken            | 
   CloseSwitchToken           | 
   OpenCaseToken              | 
   CloseCaseToken             | 
   OpenRepeatToken            | 
   CloseRepeatToken           | 
   OpenWhileToken             | 
   CloseWhileToken            | 
   OpenDowhileToken           | 
   CloseDowhileToken          | 
   ArithmeticToken            | 
   RelationalToken            | 
   BooleanToken               | 
   StringToken                | 
   NumericToken               | 
   IdentifierToken            | 
   OtherToken;

// *******************************************
// Nodes
// *******************************************

export type DeclarationNode =          { name: 'DeclarationNode', identifier: string, value: Node };
export type AssignmentNode =           { name: 'AssignmentNode', identifier: string, value: Node };
export type PrintNode =                { name: 'PrintNode', value: Node };
export type ReadNode =                 { name: 'ReadNode', identifier: IdentifierToken };
export type IfNode =                   { name: 'IfNode', argument: Node, body: SentencesNode[], alternative: SentencesNode[] };
export type SwitchNode =               { name: 'SwitchNode', argument: Node, cases: CaseNode[] };
export type CaseNode =                 { name: 'CaseNode', argument: Node, body: SentencesNode[]};
export type RepeatNode =               { name: 'RepeatNode', declaration: DeclarationNode, to: Node, steps: Node, body: SentencesNode[] };
export type WhileNode =                { name: 'WhileNode', argument: Node, body: SentencesNode[]};
export type DowhileNode =              { name: 'DowhileNode', argument: Node, body: SentencesNode[], do: boolean};
export type GroupNode =                { name: 'GroupNode', body: Node };
export type IdentifierNode =           { name: 'IdentifierNode', value: string | undefined };
export type StringNode =               { name: 'StringNode', value: string | undefined };
export type NumericNode =              { name: 'NumericNode', value: string | undefined };

export type SentencesNode = 
   DeclarationNode            | 
   AssignmentNode             |
   PrintNode                  | 
   ReadNode                   | 
   IfNode                     | 
   SwitchNode                 | 
   RepeatNode                 | 
   WhileNode                  | 
   DowhileNode;

export type Node = 
   StringExpressionNode       | 
   ArithmeticExpressionNode   | 
   RelationalExpressionNode   | 
   BooleanExpressionNode      | 
   ExpressionNode             | 
   GroupNode                  | 
   IdentifierNode             | 
   StringNode                 | 
   NumericNode;

// *******************************************
// Expressions
// *******************************************

export type StringExpressionNode =     { name: 'StringExpressionNode', left: StringNode | IdentifierNode, right: Node };
export type ArithmeticExpressionNode = { name: 'ArithmeticExpressionNode', left: NumericNode | IdentifierNode, right: Node, operator: ArithmeticToken };
export type RelationalExpressionNode = { name: 'RelationalExpressionNode', left: Node, right: Node, operator: RelationalToken };
export type BooleanExpressionNode =    { name: 'BooleanExpressionNode', left: Node, right: Node, operator: BooleanToken };
export type ExpressionNode =           { name: 'ExpressionNode', left: Node, right: Node, operator: OperatorToken};
export type ConditionalExpressionNode ={ name: 'ConditionalExpressionNode', left: Node, right: Node, operator: RelationalToken, and?: ConditionalExpressionNode | Node, or?: ConditionalExpressionNode | Node};
