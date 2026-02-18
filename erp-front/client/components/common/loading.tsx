



export function Loading(props: {
//  fun: any;
  title: any;
//  description: any;
//  other: any;

}) {
  const {
//    fun,
    title,
   // description,
   // other,

  } = props;

  
        
    return (  
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {title}
          </p>
        </div>
      </div>
  )};