pipeline {
    agent{ 
     label 'dev-3.6.124.160'
    }
        stages {
        stage('Checkout'){
            steps{
                cleanWs()
                sh 'rm -rf *'
                checkout scmGit(branches: [[name: '*/dev']], extensions: [], userRemoteConfigs: [[credentialsId: 'ONEST-ID', url: 'https://github.com/tekdi/jobs-backend.git']])
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
