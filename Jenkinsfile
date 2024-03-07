pipeline {
    agent{ 
     label 'dev-3.6.124.160'
    }
        stages {
        stage('Checkout'){
            steps{
                cleanWs()
                sh 'rm -rf *'
              //
          }
        }
        
        stage ('Build-image') {
            steps {  
                      sh 'docker build -t jobs-backend .' 
                   }
            }
       
       stage ('Deploy') {
            steps {
        
               
                      sh 'docker-compose up -d --force-recreate --no-deps backend' 
                   }
            }
       }
}
