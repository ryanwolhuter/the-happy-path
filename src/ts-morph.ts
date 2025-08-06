import { Project, ts } from "ts-morph";

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});
async function upsertStatementByIdentifier(
  sourceFilePath: string,
  identifierName: string,
  replacementText: string,
) {
  let sourceFile = project.getSourceFile(sourceFilePath);
  if (!sourceFile) sourceFile = project.addSourceFileAtPath(sourceFilePath);

  // Look for a variable statement with this identifier
  const statements = sourceFile.getStatements();
  let foundIdx = -1;
  for (let i = 0; i < statements.length; i++) {
    const decls = statements[i].getFirstDescendantByKind?.(ts.SyntaxKind.Identifier);
    if (decls && decls.getText() === identifierName) {
      foundIdx = i;
      // If the statement matches exactly, do nothing
      if (statements[i].getText().trim() === replacementText.trim()) {
        return "No change needed";
      } else {
        // Otherwise, replace the statement
        statements[i].replaceWithText(replacementText);
        await sourceFile.save();
        return "Statement replaced";
      }
    }
  }
}
