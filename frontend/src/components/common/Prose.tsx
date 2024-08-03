interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const Prose: React.FC<Props> = (props) => {
  return <div className="prose dark:prose-invert max-w-full" {...props} />;
};
